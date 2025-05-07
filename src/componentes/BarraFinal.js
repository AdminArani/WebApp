import { Typography } from "@mui/material";
import moment from "moment";
import { useContext } from "react";
import { AppContext } from "../App";


function BarraFinal(params){
    const gContext = useContext(AppContext);
    return (
        <Typography variant="body2" sx={{color: params.color||"#777777", pt: 4, pb: 2, textAlign: "center", fontSize: "1rem"}} >
            <span>
                <span style={{verticalAlign: 'middle'}}>Arani ® {moment().format("YYYY")}</span>
                <span style={{verticalAlign: 'middle'}} className="material-symbols-outlined">security_update_good</span>
                <span style={{verticalAlign: 'middle'}}>v{gContext.versionJS}</span>
            </span>
        </Typography>
    );
}

export default BarraFinal;