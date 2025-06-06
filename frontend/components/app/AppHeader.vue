<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700 left-0 w-full z-10 sticky top-0">
    <div class="px-4 py-4 sm:px-6 lg:px-8">
      <div class="container mx-auto flex flex-auto items-center">
        <VButton type="icon" color="gray" class="me-6" @click="onSidebar">
          <IconBurger class="fill-current" />
        </VButton>

        <div class="lg:hidden flex-auto"></div>

        <div class="lg:hidden h-[30px] me-10">
          <router-link to="/">
            <IconLogo class="h-[30px]"></IconLogo>
          </router-link>
        </div>

        <div class="hidden">
          <form>
            <div class="relative bg-white dark:bg-gray-900">
              <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                <svg class="fill-gray-500 dark:fill-gray-400" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                  ></path>
                </svg>
              </span>

              <input
                id="search-input"
                type="text"
                placeholder="Search or type command..."
                class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
              />

              <button
                id="search-button"
                class="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400"
              >
                <span>⌘</span>
                <span>K</span>
              </button>
            </div>
          </form>
        </div>

        <div class="flex-auto"></div>

        <div class="flex gap-4">
          <v-button type="icon" color="gray" class="hidden md:flex" @click="onChangeTheme">
            <IconTheme />
          </v-button>

          <VButton
            type="icon"
            color="gray"
            class="hidden md:flex"
            @click.prevent="
              dropdownOpen = !dropdownOpen;
              notifying = false;
            "
          >
            <span :class="!notifying ? 'hidden' : 'flex'" class="absolute right-0 top-0.5 z-1 h-2 w-2 rounded-full bg-orange-400 flex">
              <span class="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
            </span>
            <IconNoti />
          </VButton>

          <VButton type="icon" color="gray" class="hidden md:flex" @click.prevent="">
            <IconLogout />
          </VButton>
        </div>

        <div class="md:hidden flex gap-4">
          <div class="md:hidden flex gap-4">
            <v-dropdown left="unset" right="0" top="0">
              <template #activator="{ on }">
                <v-button type="icon" color="gray" class="flex" @click="on.click()">
                  <icon-dots />
                </v-button>
              </template>

              <v-list v-slot="{ item }" :list="listMenu" @click="onMenu">
                <component :is="item.icon"></component>
                <span class="ms-2">{{ item.name }}</span>
              </v-list>
            </v-dropdown>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, defineEmits, defineProps } from 'vue';

interface Props {
  changeTheme?: () => void;
}

const { changeTheme } = defineProps<Props>();

const emit = defineEmits<{
  (e: 'sidebar', value: Event): void;
}>();

const dropdownOpen = ref(false);
const notifying = ref(false);

const listMenu = computed(() => [
  { name: 'Theme', icon: 'theme' },
  { name: 'Logout', icon: 'logout' },
]);

const onSidebar = (e) => {
  console.log(e);
  emit('sidebar', e);
};

const onLogout = async () =>
  await fetch('/', {
    method: 'get',
    headers: { Authorization: 'Basic AAAAAAAAAAAAAAAAAAA=' },
  });

const onChangeTheme = () => {
  if (changeTheme) changeTheme();
};

const onMenu = ({ name }) => {
  if (name == 'Logout') onLogout();
  if (name == 'Theme') onChangeTheme();
};
</script>
