import { React } from 'react'
import { useContext , createContext} from "react"
import { UserContext } from "../App"
import { Navigate } from "react-router-dom"
import { useState } from "react"
import BLogEditor from "../components/blog-editor.component"
import PublishForm from "../components/publish-form.component"


const blogStructure = {
    title: '',
    banner: '',
    content:[],
    tags:[],
    des:'',
    author:{ personal_info:{}}
}

export const EditorContext = createContext({ })

const Editor = ()=>{


    const [blog, setBlog] = useState(blogStructure)

    const [editorState, setEditorState] = useState("editor")
    let { userAuth: {access_token}} = useContext(UserContext)
    const [textEditor, setTextEditor] = useState({isReady: false})
    
    return(
        <EditorContext.Provider value={{blog, setBlog, editorState, setEditorState,textEditor, setTextEditor}}>
        {

            access_token === null ? <Navigate to="/signin"/>
            : editorState === "editor" ? <BLogEditor/> : <PublishForm/>

        }
        </EditorContext.Provider>
    )

}

export default Editor