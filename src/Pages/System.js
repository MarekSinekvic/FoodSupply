import { useEffect, useReducer, useRef, useState } from "react";
import {getRoles } from "../Components/Login";
import { useNavigate } from "react-router-dom";
import { Button, Checkbox, Drawer, IconButton, Input, LinearProgress, Modal, ModalClose, ModalDialog, Option, Select, Stack, Tab, Table, TabList, TabPanel, Tabs, Typography } from "@mui/joy";
import { CiCirclePlus } from "react-icons/ci";
import { EntryPoint } from "../App";

function Editable({children,onApply = ()=>{}}) {
    const [isEdit, setEdit] = useState(false);
    return (
        <>
            {isEdit ? (
                <Input sx={{padding: '4px', border: '1px solid black', borderRadius: '4px'}} defaultValue={children} onKeyDown={(e)=>{
                    if (e.key == "Enter") {
                        onApply(e.target.value);
                        setEdit(false);
                    }
                }}/>
            ) : (
                <div style={{padding: '4px', borderBottom: '1px dashed rgb(150,150,150)'}} onDoubleClick={()=>{setEdit(true)}}>{children}</div>
            )}
        </>
    );
}
function CategoriesTree({category,drawerSetter = ()=>{},infoSetter=()=>{},depth=0,parent=null,rerenderer=null}) {
    return (
        <>
            {Array.isArray(category.category) ? (
                <>
                {depth > 0 ? <div style={{width: '8px',marginLeft: '8px',marginTop:'0px',borderBottom: '1px solid black'}}></div> : ''}
                <Stack direction={'column'} sx={{borderLeft: depth > 0 ? '1px solid black' : '',margin: '10px 0px',padding: '0px 4px'}}>
                    {category.category.map((c,i)=>{
                        return (
                            <>
                                <Stack direction="row" sx={{alignItems:'center'}}> 
                                    <Button variant="outlined" size="sm" color={c.category.length > 0 ? 'neutral' : 'success'} onClick={()=>{
                                        infoSetter({...c,parentCategory:category});
                                        drawerSetter(true);
                                    }}>{c.name}</Button>
                                    {c.category.length > 0 ? (
                                        (<CategoriesTree category={c} depth={depth+1} parent={category} rerenderer={rerenderer} drawerSetter={drawerSetter} infoSetter={infoSetter}/>)
                                    ) : ''}
                                    {/* {typeof (c.food) !== 'undefined' && c.food.length > 0 ? (
                                        (<CategoriesTree category={c.food} depth={depth+1} parent={category}/>)
                                    ) : ''} */}
                                </Stack>
                            </>
                        );
                    })}
                    
                    {true ? (
                        <Button size='sm' variant="outlined" onClick={async ()=>{
                            const res = await fetch(EntryPoint+`/category/create?name=New category${parent === null ? '' : ('&parent_id='+category.id)}`,{headers:{"Content-type":"application/json"},credentials: 'include'});
                            const newCategory = await res.json();
                            category.category.push(newCategory);
                            rerenderer();
                        }}>Add category</Button>
                    ) : ''}
                </Stack>
                </>
            ) : ''}
        </>
    );
}

// function roles
export default function () {
    const [rerender,_rerender] = useReducer((s,a)=>{return !s;},false);
    const navigate = useNavigate();

    const [users,setUsers] = useState([]);
    const [categories, setCategories] = useState([]);

    const search = useRef(null);
    const [isLoading, setLoading] = useState(false);

    const setterModalTarget = useRef(null);
    const setterModalName = useRef('');
    const setterModalPassword = useRef('');
    const setterModalRole = useRef('');
    const [setterModal,setSetterModal] = useState(false);

    const [info,setInfo] = useState([]);
    const [infoDrawer,setInfoDrawer] = useState(false);

    const getUsers = async ()=>{
        let query = '';
        if (search.current && search.current.value !== '')
            query = `?identifier=${search.current}`;        
        
        setLoading(true)
        const res = (await fetch(EntryPoint+"/login/list"+query,{method:'get',headers:{"Content-type":"application/json"},credentials: 'include'}));
        if (res.status != 200) return;
        const users = await res.json();

        setLoading(false);
        setUsers(users);
    }
    useEffect(()=>{
        (async ()=>{
            const roles = (await getRoles());
            
            if (roles)
                if (!roles.includes("ROLE_ADMIN"))
                    navigate('/');

            await getUsers();
        })();
        (async ()=>{
            const res = (await fetch(EntryPoint+"/category/list",{method:'get',headers:{"Content-type":"application/json"},credentials: 'include'}));
            if (res.status != 200) return;
            const categories = await res.json();

            setCategories({category:categories});
        })();
    },[]);
    return (
        <>
            <Tabs>
                <TabList>
                    <Tab>Users</Tab>
                    <Tab>Food</Tab>
                </TabList>
                <TabPanel value={0}>
                    <Stack>
                        <div className="flex w-full">
                            <Input style={{width: '90%'}} placeholder="Search target" onChange={(e)=>{search.current = e.target.value}}/>
                            <Button style={{width: '10%'}} variant="outlined" onClick={()=>{getUsers()}}>Search</Button>
                        </div>
                        {isLoading ? <LinearProgress/> : ''}
                        <Table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Identifier</th>
                                    <th>Roles</th>
                                    <th width={'100px'} style={{textAlign:'center'}}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u,i)=>{
                                    return (
                                        <tr>
                                            <td>{u.id}</td>
                                            <td><Typography fontSize={18}>{u.email}</Typography></td>
                                            <td>
                                                <Stack>
                                                    {u.roles.map((r,j)=>{return <div>{r}</div>})}
                                                </Stack>
                                            </td>
                                            <td>
                                                <Stack gap={0.5}>
                                                    <Button size="sm" color="danger" variant="outlined" sx={{width:'80px'}} onClick={async ()=>{
                                                        const res = await fetch(EntryPoint+`/login/delete/${u.id}`,{method:'get',headers:{"Content-type":"application/json"},credentials: 'include'});
                                                        _rerender(!rerender);
                                                    }}>Delete</Button>
                                                    <Button size="sm" color="primary" sx={{width:'80px'}} onClick={()=>{
                                                        setterModalName.current = u.email;
                                                        setterModalTarget.current = u.id;
                                                        setterModalRole.current = u.roles[0];
                                                        setSetterModal(true);
                                                    }}>Set</Button>
                                                </Stack>
                                            </td>
                                        </tr>
                                    );
                                })}
                                <tr>
                                    <td colSpan={4}>
                                        <div style={{display:'flex', justifyContent:'center', width:'100%'}}>
                                            <IconButton onClick={()=>{setterModalName.current=''; setterModalTarget.current=null; setterModalRole.current = ''; setSetterModal(true)}}><CiCirclePlus size="32px"/></IconButton>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                        <Modal open={setterModal} onClose={()=>setSetterModal(false)}>
                            <ModalDialog>
                                <Typography fontSize={'20px'}>Set values</Typography>
                                <Stack>
                                    <Input placeholder="Name" defaultValue={setterModalName.current} slotProps={{input:{ref:setterModalName}}}/>
                                    <Input placeholder="Password" slotProps={{input:{ref:setterModalPassword}}}/>
                                    <Select placeholder='Role' size='sm' defaultValue={setterModalRole.current} onChange={(e,v)=>{setterModalRole.current=v;}}>
                                        <Option value="">None</Option>
                                        <Option value="Kitchener">Kitchener</Option>
                                        <Option value="Waiter">Waiter</Option>
                                        <Option value="ROLE_ADMIN">Admin</Option>
                                    </Select>
                                    <Stack direction="row" marginTop={1}>
                                        <Button fullWidth="50%" onClick={async ()=>{
                                            if (setterModalTarget.current !== null)
                                                await fetch(EntryPoint+`/login/set/${setterModalTarget.current}?email=${setterModalName.current.value}&password=${setterModalPassword.current.value}&roles=${JSON.stringify([setterModalRole.current])}`,{method:'get',headers:{"Content-type":"application/json"},credentials: 'include'});
                                            else 
                                                await fetch(EntryPoint+`/login/create?email=${setterModalName.current.value}&password=${setterModalPassword.current.value}&roles=${JSON.stringify([setterModalRole.current])}`,{method:'get',headers:{"Content-type":"application/json"},credentials: 'include'});
                                            
                                            _rerender(!rerender);
                                        }}>Apply</Button>
                                        <Button fullWidth="50%" variant="outlined" onClick={()=>{setSetterModal(false)}}>Cancel</Button>
                                    </Stack>
                                </Stack>
                            </ModalDialog>
                        </Modal>
                    </Stack>
                </TabPanel>
                <TabPanel value={1}>
                    <CategoriesTree category={categories} rerenderer={_rerender} drawerSetter={setInfoDrawer} infoSetter={setInfo}/>
                    <Drawer open={infoDrawer} onClose={()=>{setInfoDrawer(false)}}>
                        <Stack sx={{padding:'4px'}} gap={2}>
                            {(info !== null) ? (
                                <>
                                    <div>ID: {info.id}</div>
                                    <Editable onApply={async (value)=>{
                                        await fetch(EntryPoint+`/category/set/${info.id}?name=${value}`,{headers:{"Content-type":"application/json"},credentials: 'include'});
                                        info.name = value;
                                        _rerender();
                                    }}>{info.name}</Editable>
                                    <Stack direction='column'>
                                        <Button color="danger" size="sm" onClick={async ()=>{
                                            await fetch(EntryPoint+`/category/remove/${info.id}`,{headers:{"Content-type":"application/json"},credentials: 'include'});
                                            const ind = info.parentCategory.category.findIndex((v)=>{if (v.id==info.id) return true; else return false;})
                                            info.parentCategory.category.splice(ind,1);
                                            _rerender();
                                            setInfoDrawer(false);
                                        }}>Remove</Button>
                                        <Button color="primary" size='sm' onClick={async ()=>{
                                            const res = await fetch(EntryPoint+`/category/create?name=New category&parent_id=${info.id}`,{headers:{"Content-type":"application/json"},credentials: 'include'});
                                            const newCategory = await res.json();
                                            info.category.push(newCategory);
                                            _rerender();
                                            setInfoDrawer(false);
                                        }}>Create branch</Button>
                                    </Stack>
                                </>
                                
                            ) : ('')}
                        </Stack>
                    </Drawer>
                </TabPanel>
            </Tabs>
        </>
    );
}