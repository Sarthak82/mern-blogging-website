// importing tools

import Embed from "@editorjs/embed"
import List from "@editorjs/list"
import Image from "@editorjs/image"
import Header from "@editorjs/header"
import Quote from "@editorjs/quote"
import Marker from "@editorjs/marker"
// import Code from "@editorjs/code"
// import Delimiter from "@editorjs/delimiter"
import InlineCode from "@editorjs/inline-code"
import { uploadImage } from "../common/aws"



const UploadImageByURL = async (e)=>{
    let link = new Promise((resolve, reject)=>{
        try{
            resolve(e)
        }catch(err){
            reject(err)
        }
    })

    const url = await link
    return {
        success: 1,
        file: {
            url: url
        }
    }
}

const UploadImageByFile = (e)=>{
    return uploadImage(e).then(url=>{
        if(url){
            return {
                success: 1,
                file: {
                    url: url
                }
            }
        }
    })
}

export const tools = {
    embed: Embed,
    list: {
        class: List,
        inlineToolbar: true
    },
    image: {
        class: Image,
        config:{
            uploader:{
                uploadByUrl:UploadImageByURL,
                uploadByFile:UploadImageByFile
            }
        }
    },
    header: {
        class: Header,
        config:{
            placeholder: "Enter a Header",
            levels:[2,3,4],
            defaultLevel:2
        }
    },
    quote: {
        class: Quote,
        inlineToolbar: true
    },
    marker: Marker,
    // code: Code,
    // delimiter: Delimiter,
    inlineCode: InlineCode
}

