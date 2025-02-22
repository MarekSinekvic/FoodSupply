import {Button, Modal, ModalDialog, Stack, Input, Typography, Snackbar } from "@mui/joy";
import { useEffect, useRef, useState } from "react";
import { GoDotFill } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { EntryPoint } from "../App";

async function getUser() {
    const res = await fetch(EntryPoint+"/login/get",{method:'post',headers:{"Content-type":"application/json"},credentials: 'include'});
    if (res.status == 200) return (await res.json());
    return null;
}
async function checkLogin() {
    const res = await fetch(EntryPoint+"/login/check",{method:'post',headers:{"Content-type":"application/json"},credentials: 'include'});
    if (res.status == 200) return true;
    return false;
}
async function getRoles() {
    const res = await fetch(EntryPoint+"/login/roles",{method:'post',headers:{"Content-type":"application/json"},credentials: 'include'});
    if (res.status == 200) return (await res.json());
    return null;
}
async function logout() {
    const res = await fetch(EntryPoint+"/logout",{method:'post',headers:{"Content-type":"application/json"},credentials: 'include'});
    return res;
}

function LoginFootnote() {
    const navigate = useNavigate();
    const [userName,setUserName] = useState('');
    useEffect(()=>{
        (async ()=>{
            const user = await getUser();
            if (user===null) return;
            
            setUserName(user.email);
        })();
    },[]);
    return (
        <>
            <Stack gap={2} direction="row" sx={{display:'flex', position: 'absolute', bottom: '0', backgroundColor:'rgb(240,240,240)', width:'100%', paddingY: "4px"}}>
                <div className="flex items-center">
                    <GoDotFill color="green"/>
                    <div>{userName}</div>
                </div>
                <Button sx={{minHeight: '14px'}} size="sm" variant="plain" onClick={()=>{
                    logout();
                    navigate('/');
                }}>Logout</Button>
            </Stack>
        </>
    );
}
function Login({open,onLogin=()=>{},onCancel=()=>{}}) {
    const [loginSnackbar, setLoginSnackbar] = useState(false);
    const username = useRef('');
    const password = useRef('');
    
    return (
        <>
            <Modal open={open}>
                <ModalDialog sx={{'padding': "32px"}}>
                    <Typography level="h3">Login</Typography>
                    <Stack>
                        <Input placeholder={'Email'} ref={username}/>
                        <Input placeholder={'Password'} ref={password}/>
                    </Stack>
                    <Stack direction={'row-reverse'} gap={1}>
                        <Button variant="outlined" onClick={()=>{onCancel()}}>Cancel</Button>
                        <Button variant="soft" onClick={async ()=>{
                            const res = await fetch(EntryPoint+"/login",{method:'post',headers:{"Content-type":"application/json"},body:JSON.stringify({username:username.current.firstChild.value,password:password.current.firstChild.value}),credentials: 'include'});
                            if (res.status == 200)
                                onLogin();
                            else
                                setLoginSnackbar(true);
                        }}>Login</Button>
                    </Stack>
                </ModalDialog>
            </Modal>
            <Snackbar variant="outlined" color='danger' open={loginSnackbar} autoHideDuration={1000}>
                Login failed
            </Snackbar>
        </>
    );
}

export default Login;
export {checkLogin,getRoles,logout,LoginFootnote};