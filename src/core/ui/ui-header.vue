<template>
    <div id="ui-header">
        <div id="logo-label">
            <img id="target-logo" :src="logoSrc" />
            <div class="title">Pendo Tagging Aid</div>
            <div id="target-logo" />
        </div>
    </div>

</template>
<script>
import { getFileURL } from '@/utils/browser-interfaces/file-management.js';

export default {
    name: 'UiHeader',
    data() {
        return {
            logoSrc: getFileURL('/public/images/pendo_target.png'),
        }
    }
}
</script>
<style lang="scss">
@import 'src/styles/variables.scss';

#ui-header {
    background-color: $gray-lighter-8;
    border-bottom: 1px solid $gray-lighter-4;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    font-family: 'proxima-nova', 'Open Sans', 'Helvetica Neue Light', 'Helvetica Neue', 'Helvetica', 'Arial',
    sans-serif;
    justify-content: center;
    height: 72px;
    padding: 10px 16px 0;
}

#logo-label{
    display: flex;
    justify-content: left;
}

#target-logo {
    display: block;
    flex-grow: 0;
    width: 36px;
}

.title {
    color: $pink;
    flex-grow: 1;
	font-weight: 500;
	font-size: 24px;
    line-height: 1.3;
    padding-left: 25px;
}
</style>