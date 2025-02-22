import { Table } from "@mui/joy";
import { useEffect, useRef, useState } from "react";
import Login,{getRoles} from "../Components/Login";
import { EntryPoint } from "../App";

export default function Processing() {
    const [orders, setOrders] = useState([]);
    const [role, setRole] = useState('');

    const updateOrders = async ()=>{
        const res = await fetch(EntryPoint+"/order/list",{credentials: 'include',headers:{'Content-Type':'application/json'}});
        if (res.status != 200)
            return;
        
        const data = await res.json();
        setOrders(data.map((v,i)=>{
            return {
                id: v.id,
                name: v.customer_name,
                progress: v.progress,
                food: v.food
            };
        }));
    };
    useEffect(()=>{
        (async ()=>{
            const roles = (await getRoles());
            
            if (roles) {
                if (roles.includes('Kitchener'))
                    setRole('kitchener')
                if (roles.includes('Waiter'))
                    setRole('waiter')
                updateOrders();
            }
        })();
    },[]);
    useEffect(()=>{
        
        const id = setInterval(()=>{
            updateOrders();
        },3000);
        return ()=>{clearInterval(id)};
    },[]);
    const progressColor = [
        'rgb(220,220,255)',
        'rgb(255, 249, 199)',
        'rgb(218, 255, 199)',
        'white'
    ];
    return (
        <>
            <Table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Customer name</th>
                        <th>Food</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((o,i)=>{
                        return (
                            <tr key={i} style={{'backgroundColor': progressColor[o.progress]}}
                                onClick={async ()=>{
                                    if (role == 'kitchener' && o.progress == 0 || o.progress == 1) {
                                        let newArr = [...orders];
                                        newArr[i].progress++;
                                        const res = await fetch(EntryPoint+`/order/progress/${o.id}?value=1`,{credentials: 'include'});
                                        if (res.status == 200)
                                            setOrders(newArr);
                                    }
                                    if (role == 'waiter' && o.progress >= 1 && o.progress < 4) {
                                        let newArr = [...orders];
                                        newArr[i].progress++;
                                        const res = await fetch(EntryPoint+`/order/progress/${o.id}?value=${newArr[i].progress}`,{credentials: 'include'});
                                        if (res.status == 200)
                                            setOrders(newArr);
                                    }
                                }}>
                                <td>{o.id}</td>
                                <td>{o.name}</td>
                                <td>
                                    {o.food.map((f,fi)=>{
                                        return <>{f.name}<br/></>
                                    })}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        </>
    );
}