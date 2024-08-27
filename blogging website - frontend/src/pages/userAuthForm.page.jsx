import {useRef} from 'react'
import AnimationWrapper from "../common/page-animation"
import InputBoxComponet from "../components/input.component"
import googleIcon  from "../imgs/google.png"
import {Link} from "react-router-dom"
import {Toaster, toast} from 'react-hot-toast'
import axios from 'axios'
import { storeInSession } from '../common/session'

const UserAuthForm = ({ type })=>{

    const authForm = useRef()

    const userAuthThroughServer = (serverRoute, formData)=>{

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
        .then(({ data }) => {
          storeInSession('user', JSON.stringify(data))
        })
        .catch(({ response }) => { 
          toast.error(response.data.error);
        });
      

    }

    const handleSubmit = (e)=>{
        e.preventDefault()

        let serverRoute = type == 'sign-in'? '/signin' : '/signup'

        let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
        let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

        // retrieving form data
        let form = new FormData(authForm.current)
        let formData={}
        for(let [key,value] of form.entries()){
            formData[key] = value
        }
    // validating data

        let {fullname, email, password} = formData

        if(fullname){
            if(fullname.length<3){
                return toast.error("Fullname must be alleast 3 letters long")
            }
        }

        if(!email.length){
            return toast.error("Email is required")
        }
        
        if(!emailRegex.test(email)){
            return toast.error("Invalid email")
        }

        if(!passwordRegex.test(password)){
            return toast.error("Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letter")
        }

        console.log(formData)
        userAuthThroughServer(serverRoute, formData)

    }


    return(

        <AnimationWrapper key={type}>
            <section className="h-cover flex items-center justify-center">
                <Toaster/>
                <form ref={authForm} className="w-[80%] max-w-[400px]">
                    <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
                        {type == "sign-in" ? "welcome back" : "join us today"}
                    </h1>
                    {
                        type!="sign-in"?
                        <InputBoxComponet
                            name="fullname"
                            type="text"
                            placeholder="fullname"
                            icon="fi-rr-user"
                        />
                        
                        :""
                    }

                        <InputBoxComponet
                            name="email"
                            type="email"
                            placeholder="E-Mail"
                            icon="fi-rr-envelope"
                        />

                        <InputBoxComponet
                            name="password"
                            type="password"
                            placeholder="Password"
                            icon="fi-rr-key"
                        />

                        <button 
                            className="btn-dark center mt-14"
                            type="submit"
                            onClick={handleSubmit}
                            >
                                { type.replace('-',' ') }
                        </button> 

                        <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">       

                            <hr className="w-1/2 border-black"/>
                                <p>or</p>
                            <hr className="w-1/2 border-black"/>
                            
                        </div>  

                        <button className="btn-dark flex items-center justify-center gap-4 w-[90%]">
                            <img src={googleIcon} className="w-5"/>
                            continue with google
                        </button>

                        {
                            type == "sign-in" ? 
                            <p className="text-center mt-6 text-dark-grey text-xl">
                                Don't have an account? <Link to="/signup" className="underline text-black text-xl ml-1">Sign up</Link>
                            </p> : 
                            <p className="text-center mt-6 text-dark-grey text-xl">
                            Already A Member? <Link to="/signin" className="underline text-black text-xl ml-1">Sign In Here</Link>
                        </p>
                        }

                </form>

            </section>
        </AnimationWrapper>
    )
}

export default UserAuthForm