import AnimationWrapper from "../common/page-animation"
import InputBoxComponet from "../components/input.component"
import googleIcon  from "../imgs/google.png"
import {Link} from "react-router-dom"

const UserAuthForm = ({ type })=>{
    return(

        <AnimationWrapper key={type}>
            <section className="h-cover flex items-center justify-center">
                <form className="w-[80%] max-w-[400px]">
                    <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
                        {type == "sign-in" ? "welcome back" : "join us today"}
                    </h1>
                    {
                        type!="sign-in"?
                        <InputBoxComponet
                            name="Full name"
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