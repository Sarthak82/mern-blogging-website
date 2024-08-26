import {Link , Outlet} from "react-router-dom"
import logo from '../imgs/logo.png'
import { useState } from "react"

const Navbar = ()=>{

    const [searchBoxVisibility, setSearchBoxVisibility]= useState(false)
    
    return(
        <>
            <nav className="navbar">

                <Link to='/' className='flex-none w-10'>
                    <img src= {logo}  className="w-full"/>
                </Link>
            
                <div className={"absolute bg-white w-full left-0 top-full mt-0.5 border-b border-grey py-4 px-[5vw] md: border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto md:show "+( searchBoxVisibility ? "show" : "hide")}>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full md:w-auto bg-grey p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder: text-dark-grey md:pl-12"
                    />

                    <i className="fi fi-rr-search absolute right-[10%] md:pointer-event-none md:left-5 top-[34%] itranslate-y-1/2 text-xl text-dark-grey md:top-[27%]"></i>

                </div>


                <div className="flex item-centre gap-3 md:gap-6 ml-auto">
                    
                    <button className="md:hidden bg-grey w-12 h-12 rounded-full  items-centre justify-center"
                    onClick={()=> setSearchBoxVisibility(!searchBoxVisibility)}
                    >
                        <i className="fi fi-rr-search text-xl"></i>
                    </button>

                    <Link to='/editor' className="hidden md:flex gap-2 link">
                        <i className="fi fi-rr-file-edit"></i>
                        <p>writer</p>
                    </Link>

                    <Link to='/signin' className="btn-dark ">
                        <p>sign in</p>
                    </Link>
                    <Link to='/signup' className="btn-light hidden md:block">
                        <p>sign Up</p>
                    </Link>
                </div>
            </nav>

            <Outlet/>
        </>
    )
}


export default Navbar