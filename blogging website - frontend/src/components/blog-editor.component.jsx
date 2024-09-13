import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'
import logo from "../imgs/logo.png"
import AnimationWrapper from '../common/page-animation';
import defaultBanner from "../imgs/blog banner.png"
import { uploadImage } from '../common/aws';
import { Toaster, toast } from 'react-hot-toast';
import { EditorContext } from '../pages/editor.pages';
import EditorJS from '@editorjs/editorjs';
import { tools } from './tools.component';
import axios from 'axios';
import { UserContext } from '../App';


const BLogEditor = ()=>{
    

    let { blog, blog : {title, banner, content, tags, des}, setBlog, textEditor, setTextEditor, setEditorState} = useContext(EditorContext)

    let Navigate = useNavigate()

    let { userAuth: { access_token }} = useContext(UserContext)

    useEffect(()=>{
        if(!textEditor.isReady){
            setTextEditor( new EditorJS({
                holder: 'textEditor',
                data: content,
                tools: tools,
                placeholder: "Let's write a greate Story Here",
        }))
    }
    },[])

    const handleBannerUpload =(e)=>{
        let img = e.target.files[0]
        // console.log(img)

        if(img){

            let loadingToast = toast.loading("Uploading Image")

            uploadImage(img).then((url)=>{
                console.log(url)
                if(url){
                    toast.dismiss(loadingToast)
                    toast.success("Image Uploaded")

                    setBlog({ ...blog, banner:url })
                }
            }).catch(error =>{
                toast.dismiss(loadingToast)
                toast.error("Error Uploading Image")
            })
        }
    }

    const handleTitleKeyDown = (e)=>{
        if(e.keyCde==13){
            e.preventDefault();
        }
    }

    const hanleTitleChange = (e)=>{
        // console.log(e.target.value)
        let input = e.target
        input.style.height = 'auto'
        input.style.height = input.scrollHeight+'px'

        setBlog({ ...blog, title: input.value })
    }

    const handleError = (e)=>{
        e.target.src = defaultBanner
    }

    const handlePublishEvent = ()=>{
        if(!banner.length){
            return toast.error("Upload a blog Banner to Publish it")
        }

        if(!title.length){
            return toast.error("Add a Blog Title")
        }

        if(textEditor.isReady){
            textEditor.save().then((data)=>{
                if(data.blocks.length){
                    setBlog({ ...blog, content: data })
                    setEditorState("publish")
                }else{
                    toast.error("Add some content to your blog")
                }
            }).catch((error)=>{
                console.log(error)
            })
        }
    }


    const handleSaveDraft = (e)=>{

        if(e.target.className.includes('disable')){
            return
        }

        if(!title.length){
            return toast.error("Blog Title Required before saving it as draft")
        }

        let loadingToast = toast.loading("Saving Draft")

        e.target.classList.add('disable')
        
        if(textEditor.isReady){
            textEditor.save().then(content=>{

                let blogObj ={title, banner, content, tags, des , draft: true}

                axios.post(import.meta.env.VITE_SERVER_DOMAIN+'/create-blog',blogObj, {
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                }).then(()=>{
                    e.target.classList.remove('disable')
                    toast.dismiss(loadingToast)
                    toast.success("Saved")
        
                    setTimeout(()=>{
                        Navigate("/")
                    }, 500)
                }).catch(({ response })=>{
        
                    e.target.classList.remove('disable')
                    toast.dismiss(loadingToast)
        
                    return toast.error(response.data.error)
                
                })
            })
        }

        



    }

    return(
        <>
            <nav className="navbar">
                <Link to="/" className='flex-none w-10'>
                    <img src={logo}/>
                </Link>
                <p className='max-md:hidden text-black line-clamp-1 w-full'>
                    {title.length ? title : "New Blog"}
                </p>

                <div className='flex gap-4 ml-auto'>
                    <button className='btn-dark py-2'
                        onClick={handlePublishEvent}
                    >
                        Publish
                    </button>

                    <button className='btn-light py-2' onClick={handleSaveDraft}>
                        Save Draft
                    </button>

                </div>

            </nav>

            <Toaster/>
            <AnimationWrapper>
                <section>
                    <div className='mx-auto mx-w-[900ox] w-full'>

                        <div className='relative aspect-video hover:opacity-80 bg-white border-4 border-grey'>
                            
                            <label htmlFor='uploadBanner'>
                                <img 
                                    src={banner}
                                    className='z-20'
                                    onError={handleError}
                                />
                                <input
                                    id='uploadBanner'
                                    type='file'
                                    accept='.png, .jpg, .jpeg'
                                    hidden
                                    onChange={handleBannerUpload}
                                />

                            
                            </label>
                        </div>

                        <textarea
                            defaultValue={title}
                            placeholder="Blog Title"
                            className='text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40'
                            onKeyDown={handleTitleKeyDown}
                            onChange={hanleTitleChange}
                        >

                        </textarea>

                        <hr className='w-full opacity-10 my-5'/>

                        <div id="textEditor" className='font-gelasio'>

                        </div>
                    </div>
                </section>
            </AnimationWrapper>
        </>
    )
}


export default BLogEditor;