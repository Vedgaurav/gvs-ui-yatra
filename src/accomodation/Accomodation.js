
import { useContext, useEffect, useState } from "react"
import "./acc.css"
import axios from "axios"
import PleaseWait from "../pleaseWait/PleaseWait.js"
import { GET_ALL_REG_MEM_DETAILS, GET_ALL_ROOMS, SAVE_ACCOMODATAION_DETAIL_WITHOUT_PAYMENT } from "../constants/apiConstant"
import { PleaseWaitContext } from "../context/PleaseWaitContextProvider.js"
import AccomodationModal from "./AccomodationModal"
import { useNavigate } from "react-router-dom"


export default ({ dbUserData, dbRegMemIdList }) => {
    console.log(dbUserData)
    const [isOpen,setIsOpen]=useState(false)
    const [bookingDetails,setBookingDetails]=useState([])
    const [roomType,setRoomType]=useState("")
    const [memCount,setMemCount]=useState()
    const [regMemDetails, setRegMemDetails] = useState([])
    const [successMem, setSuccessMem] = useState([])
    const [rooms, setRooms] = useState([1])
    const { gWaitOn, setGWaitOn } = useContext(PleaseWaitContext)
    const navigate = useNavigate()

    const getMembers = (regMemDetails) => {
        let temp = []
        regMemDetails.map((one) => {
            if (one.paymentStatus == "success") {
                let memList = one.memberIdList
                temp = [...temp, ...memList]
            }

        })
        setSuccessMem(temp)
    }
     const saveBookingData=(e)=>{
        console.log(e);
        setBookingDetails([...bookingDetails,e])
        console.log(bookingDetails)
     }
    useEffect(() => {

        const fetchAllRoomsAndRegMem = async () => {
             setGWaitOn(true)
            const regMemRes = await axios.post(GET_ALL_REG_MEM_DETAILS, { email: "saurav109677@gmail.com" })
            setRegMemDetails(regMemRes.data)
            getMembers(regMemRes.data)
            const res = await axios.post(GET_ALL_ROOMS)
            console.log(res);
            setRooms(res.data)
             setGWaitOn(false)
        }

        fetchAllRoomsAndRegMem()

    }, [])
    const handleRemove = (e, i) => {
        e.preventDefault();
        const removeBooking = bookingDetails.filter((a, index) => index !== i);
        setBookingDetails(removeBooking);
      };

      const proceedAndPay = async() => {
        //save the data in db with INITIATED status
        const temp = {
            "roomSet": [
                {
                    "roomType": {
                        "roomId": "ABC213"
                    },
                    "member": [
                        {
                            "id": "25"
                        },
                        {
                            "id": "26"
                        }
                    ],
                    "memCheckInTime": "21-06-2023",
                    "memCheckOutTime": "21-06-2023"
                },
                {
                    "roomType": {
                        "roomId": "BKNT"
                    },
                    "member": [
                        {
                            "id": "27"
                        },
                        {
                            "id": "28"
                        }
                    ],
                    "memCheckInTime": "21-06-2023",
                    "memCheckOutTime": "21-06-2023"
                }
            ],
            "amount": "4000",
            "customerTxnId": "dunny"

        }

        //save the data in db
        try {
            const response = await axios.post(SAVE_ACCOMODATAION_DETAIL_WITHOUT_PAYMENT, temp)
            const bookingId = response.data.bookingId
            const amount = response.data.amount
            //procced to payment page
            navigate("/payAcc",{state:{bookingId:bookingId,amount:amount}})
        }
        catch (e) {
            console.log(e);
        }

    }

    const template =
        <div class="container">
            <h1 class="display-4">Accommodation</h1><br /><br />
            <h4>Registered Members</h4>

            <table class="table">
                <tbody>
                    {successMem.map((mem, index) => (

                        <tr>
                            <td>{index + 1}. {mem.dbDevId} | {mem.dbDevName} |  {mem.dbDevGender}  </td>
                        </tr>
                    ))}
                </tbody>

            </table>
            <h5>Please choose your accommodation</h5>
            <div class="row card-wrapper">
                {rooms.map((one, index) => {
                    let avail = one.count > 0 ? true : false
                    return (
                        <div class="col ">
                            <div class="card" style={{ "width": "18rem", "padding": "0px" }}>
                                <img class="card-img-top" src="https://th.bing.com/th/id/OIP.qLVYj_t-HU2Yyx3v_wFgLwHaE6?pid=ImgDet&rs=1" alt="Card image cap" />
                                <div class="card-body">
                                    <h4>{one.type}</h4>
                                    <p>{one.description}</p>
                                    <p>CheckIn Time:{one.checkInTime}</p>
                                    <p>CheckOut Time: {one.checkOutTime}</p>
                                    <ul class="list-group list-group-flush">
                                        <li class="list-group-item"><b>Price: </b><h4 style={{ "display": "inline-block" }}>{one.price}</h4></li>
                                        {avail ? <li class="list-group-item" style={{ "color": "green" }}><b>AVAILABLE: </b><h5 style={{ "display": "inline-block" }}>{one.count}</h5></li>
                                            : <li class="list-group-item" style={{ "color": "red" }}><b>AVAILABLE: </b><h5 style={{ "display": "inline-block" }}>{one.count}</h5></li>}
                                    </ul>
                                </div>

                                <div class="card-body">
                                    <button class="btn btn-warning"  onClick={()=>{setIsOpen(true);setRoomType(one.roomId);setMemCount(one.memberCount)}}>Book Now</button>
                                </div>
                            </div>
                        </div>
                    )
                })}
                                 <AccomodationModal dbUserData={dbUserData} dbRegMemIdList={dbRegMemIdList} open={isOpen} roomType={roomType} memCount={memCount} onClose={()=>setIsOpen(false)} onSave={saveBookingData}/> 



            </div>
            {bookingDetails.length!==0 ?<h4>Booking Details</h4>:""}

            
                
                    {bookingDetails.map((e, index) => (

                      <table class="table card">
                       <tr><th><td>Room Id</td>
                        <td>Added Members</td>
                        <td>Arrival Time</td>
                        <td>Departure Time</td>
                        <td>Action</td></th></tr>
                        <tbody>
                        <tr>
                            <td> {e.roomType?.roomId} </td>
                            <td> {e.members?.map((e)=>(e.fname + " ."))} </td>
                            <td>  {e?.memCheckInTime.replace("T"," ")} </td>
                            <td> {e?.memCheckOutTime.replace("T"," ")}  </td>
                            <td> <div className="col-2">
                        <button onClick={(e) => handleRemove(e, index)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div></td>
                        </tr>
                        </tbody>

            </table>
                    ))}

            <button onClick={()=>proceedAndPay()}>Proceed to Pay</button>
                
        </div>

    return <>{gWaitOn ? <PleaseWait /> : template}</>
}