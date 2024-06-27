// import logoArani from "./images/logoarani.png";
import { Button, Dialog, DialogContent, useMediaQuery, DialogTitle, DialogActions, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
// import axios from "axios";
import { AppContext } from "../App";
import axios from "axios";
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import 'dayjs/locale/es';
// import moment from "moment";
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useTheme } from "@emotion/react";
import parse from "html-react-parser";

function Contrato(){
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [dataContrato, set_dataContrato] = useState(false);
    const [openVetana, set_openVetana] = useState(false);
    const [cargandoC, set_cargandoC] = useState(false);
    const gContext = useContext(AppContext);

    // useEffect(()=>{
    //     // console.log("params", params);
    // },[params])

    useEffect(()=>{

        getContrato();
        // eslint-disable-next-line
    }, []);

    useEffect(()=>{

        console.log('dataContrato', dataContrato);
    }, [dataContrato]);

    function getContrato(){
        axios.request({
            url: `${process.env.REACT_APP_API_URL}/api/app/get_contract.php`,
            method: "post",
            data: {
                sid: gContext.logeado.token,
                },
        })
        .then((res) => {
            if(res.data.status === "ER"){
            }
            if(res.data.status === "OK"){
                if(res.data.payload?.document_content){
                    set_dataContrato(res.data.payload);
                    set_openVetana(true);
                }else{
                    set_dataContrato(false);
                    set_openVetana(false);
                }
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    const firmarContrato = ()=>{
        set_cargandoC(true);
        axios.request({
            url: `${process.env.REACT_APP_API_URL}/api/app/post_contract_sign.php`,
            method: "post",
            data: {
                sid: gContext.logeado.token,
                document_id: dataContrato.id,
                },
        })
        .then((res) => {
            set_cargandoC(false);
            set_openVetana(false);
            if(res.data.status === "ER"){
            }
            if(res.data.status === "OK"){
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    return (
        <Dialog fullScreen={fullScreen} open={openVetana} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" >
            <DialogTitle>Contrato de préstamo</DialogTitle>
            <DialogContent dividers>
                {cargandoC && <Typography sx={{textAlign: 'center', m: '4rem auto'}}>Cargando....</Typography>}
                {!cargandoC && 
                <div>
                    {parse(dataContrato.document_content+"")}
                </div>
                }
                
            </DialogContent>
            <DialogActions>
                <Button onClick={()=>{firmarContrato()}}>Firmar</Button>
            </DialogActions>
      </Dialog>
    );
}


export default Contrato;


