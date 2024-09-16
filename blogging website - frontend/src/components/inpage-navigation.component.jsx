import { useEffect, useRef , useState} from 'react'

export let activeTabLineRef
export let activeTabRef

const InPageNavigation =({ routes, defaulthidden=[],defaultActiveIndex=0 , children})=>{

    activeTabLineRef = useRef()
    activeTabRef = useRef()
    let [inPageNavIndex,setInPageNavIndex] = useState(defaultActiveIndex)

    const chnagePageState = (btn,i)=>{

        let { offsetWidth, offsetLeft } = btn
        activeTabLineRef.current.style.width = `${offsetWidth}px`
        activeTabLineRef.current.style.left = `${offsetLeft}px`

        setInPageNavIndex(i)   
    }


    useEffect(()=>{
        chnagePageState(activeTabRef.current,defaultActiveIndex)
    },[])
    return(
        <>
            <div className="relative mb-8 bg-white border-b border-grey flex flex-nowrap overflow-x-auto">

                {
                    routes.map((route,index)=>{
                        return(
                            <button 
                            ref={index=== defaultActiveIndex? activeTabRef:null}
                            key={index} className={"p-4 px-5 capitalize "+(inPageNavIndex==index ? "text-black ":"text-dark-grey ") + (defaulthidden.includes(route)?"md:hidden":"")}
                            onClick={(e)=>[
                                chnagePageState(e.target, index)
                            ]}
                            >
                                {route}
                            </button>
                        )
                    })
                }


                <hr ref={activeTabLineRef} className='absolute bottom-0 duration-300'/>

            </div>

            { Array.isArray(children) ? children[inPageNavIndex] : children}
        </>
    )
}

export default InPageNavigation