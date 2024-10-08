const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const getDay = (timestamp) =>{
    let date = new Date(timestamp)

    return `${date.getDate()} ${month[date.getMonth()]}`
}


export const getFullDay=(timestamp)=>{
    let date = new Date(timestamp)

    return `${date.getDate()} ${month[date.getMonth()]} ${date.getFullYear()}`
}