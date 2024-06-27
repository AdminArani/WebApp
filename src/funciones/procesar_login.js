import axios from "axios";

export default function procesar_login(usr, pass, okcallback, errorcallback){
    axios.request({
        url: `${process.env.REACT_APP_API_URL}/api/app/login.php`,
        method: "post",
        data: {
            UsrUsr: usr || "",
            UsrPwd: pass || "",
        },
    })
    .then((res) => {
        // console.log(res);
        if(res.data.status === "ER"){
            if(typeof errorcallback === 'function'){
                errorcallback(res.data.payload.message);
            }
        }
        if(res.data.status === "OK"){
            if(typeof errorcallback === 'function'){
                okcallback(res.data);
            }
        }
    }).catch(err => {
        // console.log(err);
        if(typeof errorcallback === 'function'){
            errorcallback(err.message);
        }
    });
}