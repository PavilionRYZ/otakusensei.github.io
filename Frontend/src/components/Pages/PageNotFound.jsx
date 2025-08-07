import React from 'react'
import notfound from "../../assets/notfound.gif"
import { Link } from 'react-router-dom'
const PageNotFound = () => {
  return (
    <div className='flex flex-col gap-4 bg-[#121A21] dark:bg-white justify-center items-center min-h-screen'>
      <img src={notfound} alt="notfound" />
      <Link to="/">
        <button className='w-full p-3 rounded-md bg-[#243647] text-white  dark:bg-[#E8B5B8] dark:hover:bg-[#e59ea3] transition duration-300'>Go Back</button>
      </Link>
    </div>
  )
}

export default PageNotFound