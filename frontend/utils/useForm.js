import { ref, computed, reactive, watch } from 'vue'

export const useForm = (init = {}, form) => {
    const defaultInit = init
    const v = reactive({})

    const reset = () => {
        for (const key in defaultInit) {
            const validators = defaultInit[key]
            v[key] = useField(validators, key, form)
        }
    }

    reset()

    const invalid = computed(() => Boolean(Object.values(v).filter(i => !i.valid)?.length))
    const data = computed(() => {
        const data = {}
        for (const key in v) {
            data[key] = v[key].value
        }
        return data
    })

    const getError = (name, errors = []) => {
        const error = v?.[name]?.error || errors?.[name]?.[0] || '';
        return error ? error : '';
    };

    const validateAll = () => {
        for (const key in v) {
            const validate = v[key].validate
            validate(v[key].value)
        }
    }

    watch(v, validateAll)

    return {
        v,
        invalid,
        data,
        reset,
        getError
    }
}

export const useField = (validators = {}, key, form) => {
    const valid = ref(true)
    const value = ref(form[key])
    const dirty = ref(false)
    const error = ref({})

    const validate = (value) => {
        form[key] = value
        const errors = []
        for (const key in validators) {
            const valid = validators[key](value);
            if (valid === false || typeof valid === 'string') {
                errors.push(valid)
            }
        }
        error.value = errors.length ? errors[0] : '';
        valid.value = Boolean(!errors.length)
    };

    const blur = () => dirty.value = true

    watch(value, validate)
    validate(value.value)

    return {
        value,
        valid,
        dirty,
        error: computed(() => dirty.value ? error.value : ''),
        blur,
        validate
    }
}