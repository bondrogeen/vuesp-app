import { EventEmitter } from 'node:events';
import WebSocket from 'ws';
import Struct from 'vuesp-struct';
import AxiosDigestAuth from '@mhoc/axios-digest-auth';

const fetch = digestAuth => ({
  get: options => digestAuth.request({ ...options, method: 'GET' }),
  post: options => digestAuth.request({ ...options, method: 'POST' }),
});

class Device extends EventEmitter {
  #id;
  #ip;
  #ws;
  #time;
  #name;
  #list;
  #fetch;
  #state;
  #struct;
  #address;
  #options;
  #interval;
  #isConnect;
  #reconnectTime;
  #menu = [];

  constructor({ name = '', ip, username = '', password = '', options = {}, reconnectTime = 15000 }) {
    if (!ip) throw new TypeError("'ip' is required!");
    super();
    this.#ip = ip;
    this.#ws = null;
    this.#name = name;
    this.#time = new Date();
    this.#list = [];
    this.#state = {};
    this.#fetch = fetch(new AxiosDigestAuth({ username, password }));
    this.#struct = new Struct();
    this.#address = `ws://${ip}/esp`;
    this.#options = options;
    this.#interval = null;
    this.#isConnect = false;
    this.#reconnectTime = reconnectTime;
  }

  get ip() {
    return this.#ip;
  }

  get name() {
    return this.#name;
  }

  get menu() {
    return this.#menu;
  }

  get list() {
    return this.#list;
  }

  get id() {
    const device = this.getInfo();
    const id = device?.id || -1;
    return id
  }

  async onInit() {
    try {
      const { data } = await this.#fetch.get({ url: `http://${this.#ip}/struct.json` });

      this.#struct.init(data);
      this.#onEvent('init', true);
      this.send('INFO');
    } catch (error) {
      this.#onEvent('error', error);
      console.warn(error);
    }
  }

  async loadModule(url) {
    try {
      return await this.#fetch.get({ url });
    } catch (error) {
      console.warn(error);
      return;
    }
  };

  async onList() {
    let list = await this.loadModule(`http://${this.#ip}/fs?file=/tmp/list.js`);
    if (!list) {
      list = await this.loadModule(`http://${this.#ip}/list.js`);
    }
    const data = list?.data
    if (data.includes('export default')) {
      const module = await import('data:text/javascript,' + data);
      this.#list = module?.default || []
    }

  }

  async onMenu() {
    try {
      const { data } = await this.#fetch.get({ url: `http://${this.#ip}/menu.json` });
      this.#menu = data || []
    } catch (error) {
      this.#onEvent('error', error);
      console.warn(error);
    }
  }

  get fetch() {
    return this.#fetch
  }

  getInfo() {
    const info = this.#state?.INFO || {};
    return { ...info, name: this.#name, ip: this.#ip, time: this.#time };
  }

  #onEvent(event, data) {
    const device = this.getInfo();
    const id = device?.id || 0;
    const payload = { event, ...data, id: this.id };
    this.emit(event, payload);
    this.emit('*', payload);
  }

  #onPing() {
    const delta = new Date().getTime() - this.#time;
    this.#onEvent('ping', { key: 'PING', data: { delta } });
    this.#isConnect = delta < this.#reconnectTime;
    // console.log(delta);
    if (delta > this.#reconnectTime) this.#onReconnect();
  }

  async #onOpen(e) {
    this.#isConnect = true;
    await this.onInit();
    await this.onList();
    await this.onMenu();
    this.#onEvent('open', e);
  }

  #onMessage(message) {
    this.#time = new Date().getTime();
    this.#onEvent('raw', message);
    if (message instanceof ArrayBuffer) {
      const data = this.#struct.get(message);
      if (data) {
        const { object, key } = data;
        if (key === 'PING') return;
        this.#state[key] = object;
        this.#onEvent('message', { data: object, key });
      }
    }
  }

  #onClose(e) {
    this.#isConnect = false;
    this.#onEvent('close', e);
  }

  #onError() {
    this.#isConnect = false;
    this.#ws.terminate();
  }

  #onReconnect() {
    this.#time = new Date().getTime();
    console.log('onReconnect');
    this.#onEvent('reconnect');
    this.disconnect();
    this.connect();
  }

  getStatus() {
    return {
      time: this.#time,
      ip: this.#ip,
    };
  }

  connect() {
    try {
      this.#ws = new WebSocket(this.#address, this.#options);
      this.#ws.binaryType = 'arraybuffer';
      this.#ws.on('open', this.#onOpen.bind(this));
      this.#ws.on('message', this.#onMessage.bind(this));
      this.#ws.on('close', this.#onClose.bind(this));
      this.#ws.on('error', this.#onError.bind(this));
      if (!this.#interval) this.#interval = setInterval(this.#onPing.bind(this), 1000);
      return true;
    } catch (error) {
      this.#onEvent('error', error);
      console.error(error);
      return false;
    }
  }

  disconnect() {
    this.#isConnect = false;
    if (this.#interval) clearInterval(this.#interval);
    this.#interval = null;
    this.#ws.close();
    this.#ws = null;
    return true;
  }

  send(comm, data) {
    if (this.#isConnect) {
      const buffer = this.#struct.set(comm, data);
      if (buffer) {
        this.#ws.send(buffer);
        return true;
      }
    }
    return false;
  }
}

export default Device;
