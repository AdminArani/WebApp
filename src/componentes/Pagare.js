import { Button, Dialog, DialogContent, useMediaQuery, DialogTitle, DialogActions, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../App";
import axios from "axios";
import { useTheme } from "@emotion/react";
import parse from "html-react-parser";
import config from "../config";
function Pagare({
  open,
  onClose
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [dataPagare, set_dataPagare] = useState(false);
  const [cargandoP, set_cargandoP] = useState(false);
  const gContext = useContext(AppContext);
  useEffect(() => {
    if (open) {
      getPagare();
    }
    // eslint-disable-next-line
  }, [open]);
  function getProfile() {
    return axios.request({
      url: `${config.apiUrl}/api/app/getProfile.php`,
      method: "post",
      data: {
        sid: gContext.logeado?.token
      }
    }).then(res => {
      if (res.data.status === "OK") {
        return res.data.payload?.data;
      }
      throw new Error('Error al cargar perfil');
    });
  }
  function getPagare() {
    set_cargandoP(true);
    getProfile().then(profileData => {
      const customerId = profileData?.customer_id;
      if (!customerId) {
        set_dataPagare(false);
        return null;
      }
      return axios.request({
        url: `${config.apiUrl}/api/app/get_pagareCustomerId.php`,
        method: "post",
        params: {
          customerId: customerId
        }
      });
    }).then(res => {
      set_cargandoP(false);
      if (!res) {
        return;
      }
      if (res.data.status === "OK") {
        if (res.data.payload?.document_content) {
          set_dataPagare(res.data.payload);
        } else {
          set_dataPagare(false);
        }
      } else {
        set_dataPagare(false);
      }
    }).catch(err => {
      set_cargandoP(false);
      set_dataPagare(false);
    });
  }
  return <Dialog fullScreen={fullScreen} open={open} onClose={onClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
            <DialogTitle>Pagare</DialogTitle>
            <DialogContent dividers>
                {cargandoP && <Typography sx={{
        textAlign: 'center',
        m: '4rem auto'
      }}>Cargando....</Typography>}
                {!cargandoP && dataPagare?.document_content && <div>
                    {parse(dataPagare.document_content + "")}
                </div>}
                {!cargandoP && !dataPagare?.document_content && <Typography sx={{
        textAlign: 'center',
        m: '4rem auto'
      }}>Cargando...</Typography>}
                
            </DialogContent>
            <DialogActions sx={{
      justifyContent: 'flex-start'
    }}>
                <Button onClick={onClose}>Cerrar</Button>
            </DialogActions>
      </Dialog>;
}
export default Pagare;
