import Vue from "vue";
import VueI18n from "vue-i18n";

import zh_CN from "./zh_CN";
import zh_TW from './zh_TW';
import en_US from "./en_US";
import ko_KR from './ko_KR';
import ja_JP from './ja_JP';

Vue.use(VueI18n)

export default new VueI18n({
	locale: 'zh_CN',
	messages: {
		zh_CN,
		zh_TW,
		en_US,
		ko_KR,
		ja_JP
	}
});