import { Badge, IconButton, Divider, Menu, Typography, List, ListItem, ListItemText } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../App";
import AraniLogo from "../images/logoarani.png";

function BarraApp(){
    const gContext = useContext(AppContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const [notiNum, set_notiNum] = useState(0);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    useEffect(()=>{
        // console.log('ini');
        const intervalNotis = setInterval(() => {
            axios.request({
                url: `${process.env.REACT_APP_API_URL}/api/app/getNotificationNum.php`,
                method: "post",
                data: {
                    sid: gContext.logeado?.token,
                  },
            })
            .then((res) => {
                if(res.data.status === "OK"){
                    // console.log(res.data.payload);
                    set_notiNum(res.data.payload.NotNum)
                }
            }).catch(err => {
                console.log(err.message);
            });
        }, 10000);
        return ()=>{
            // console.log('fin');
            clearInterval(intervalNotis);
        }
        // eslint-disable-next-line
    },[]);

    return (
        <>
        <div className="barraapp">
            <div>
                <img alt="Logo ARANI" style={{width: '15rem', marginRight: '1rem'}} src={AraniLogo} />
            </div>
            <div className="barraapp-btnsder">
                <IconButton component={Link} to="/" sx={{mt: 3}}>
                    <span style={{fontSize: '2rem'}} className="material-symbols-outlined">home</span>
                </IconButton>
                <IconButton component={Link} to="/perfil" sx={{mt: 3}}>
                    <span style={{fontSize: '2rem'}} className="material-symbols-outlined">account_circle</span>
                </IconButton>
                <IconButton onClick={handleMenu} sx={{mt: 3}}>
                    <Badge badgeContent={notiNum} color="primary">
                        <span style={{fontSize: '2rem'}} className="material-symbols-outlined">notifications</span>
                    </Badge>
                </IconButton>
                <Menu id="menu-appbar" keepMounted anchorEl={anchorEl} 
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <Notificaciones chstdopen={Boolean(anchorEl)} />
              </Menu>
            </div>
        </div>
        <Divider sx={{mb: 2, pb: 2}} />
        </>
    );
}



function Notificaciones({chstdopen}){

    const gContext = useContext(AppContext);
    const [cargando, set_cargando] = useState(false);
    const [listaNotis, set_listaNotis] = useState([]);
   
    function cargarnotificaciones(){
        set_cargando(true);
        axios.request({
            url: `${process.env.REACT_APP_API_URL}/api/app/getNotification.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
              },
        })
        .then((res) => {
            set_cargando(false);
            if(res.data.status === "ERS"){
                localStorage.removeItem('arani_session_id');
                localStorage.removeItem('arani_session_data');
                gContext.set_logeado({estado: false, token: '', data: {}});
            }
            if(res.data.status === "ER"){
                console.log(res.data.payload.message);
            }
            if(res.data.status === "OK"){
                // console.log(res.data.payload);
                set_listaNotis(res.data.payload);
                
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    function eliminarNotificacion(id){
        axios.request({
            url: `${process.env.REACT_APP_API_URL}/api/app/delNotification.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
                NotCod: id,
              },
        })
        .then((res) => {
            cargarnotificaciones();
        }).catch(err => {
            console.log(err.message);
        });
    }

    useEffect(()=>{
        // console.log('adasd');
        cargarnotificaciones();
        // eslint-disable-next-line
    },[]);

    useEffect(()=>{
        // console.log('adasd');
        if(chstdopen){
            cargarnotificaciones();
        }
        // eslint-disable-next-line
    },[chstdopen]);

    return (<Box sx={{p:2}}>
        {cargando && 
            <Typography variant="body2" sx={{color: 'silver', m: '1rem', textAlign: 'center' }}>Cargando....</Typography>
        }
        {(!cargando && listaNotis.length > 0) && <Box sx={{maxWidth: '25rem'}}>
            <Typography variant="h5">Notificaciones</Typography>
            <Divider sx={{mt: 2}} />
            <List sx={{mt: 2}}>
                {listaNotis.map((element, key)=>{
                    return(
                        <ListItem key={key} disablePadding>
                            <ListItemText sx={{fontSize: '0.8rem'}} primary={<>{element.NotTit}<Typography component={"span"} variant="body2" sx={{color: 'silver', pl: 1}} >{moment(element.NotFch).fromNow()}</Typography></>} secondary={<>{element.NotDsc}</>} />
                            
                            <IconButton onClick={()=>{eliminarNotificacion(element.NotCod)}} sx={{ml: 4}} aria-label={()=>{alert('asdad')}}>
                                <span className="material-symbols-outlined">delete</span>
                            </IconButton>
                        </ListItem>
                    )
                })}
            </List>
        </Box>
        }
        {(!cargando && listaNotis.length === 0) && <Box sx={{maxWidth: '25rem'}}>
            <Typography>Notificaciones</Typography>
            <Divider sx={{mt: 2}} />
            <Typography variant="body2" sx={{m: "1rem 0 1rem 0", color: 'silver'}} >No hay notificaciones por los momentos</Typography>
        </Box>
        }
    </Box>)
}


export default BarraApp;