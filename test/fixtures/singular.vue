<template>
    <div>
        <h1 :title="$t('Description')">{{ $t("This is a title") }}</h1>
        <p :title="$t('Description')">{{ $t('This is wrapped in single quotes') }}</p>
        <p>{{ $t('\'single escape\'') }}</p>
        <p>{{ $t("\"double escape\"") }}</p>
        <p>{{ $t("word \"escaped, word\", with comma") }}</p>
        <p>{{ $t("ending with an escaped quote\"") }}</p>
    </div>
</template>

<script>
    export default {
        data: function () {
            return {
                t1: this.$t('data \'single escape\''),
                t2: this.$t("data \"double escape\""),
                t3: this.$t("Description")
            };
        }
    }
</script>