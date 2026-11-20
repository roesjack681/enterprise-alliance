import { GetEnLang } from "./en_US"
import { GetZhLang } from "./zh_CN"

export const getLang = (msg: string,lang: string = "zh_CN") => {
    if (lang == "zh_CN"){
        return GetZhLang(msg)
    } 
    if (lang == "en_US"){
        return GetEnLang(msg)
    }
}