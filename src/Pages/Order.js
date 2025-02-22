import { Button, IconButton, LinearProgress, Table } from "@mui/joy";
import { createContext, useContext, useEffect, useReducer, useRef, useState } from "react";
import { BiEuro } from "react-icons/bi";
import { MdKeyboardArrowLeft } from "react-icons/md";
import Login, { checkLogin } from "../Components/Login";
import { useNavigate } from "react-router-dom";
import { EntryPoint } from "../App";


function Category({children, icon, link,target}) {
    const category = useContext(CategoryContext);
    const select = () => {
        const T = category.selected.findIndex((v)=>{return v.id==target.id;});
        
        if (T == -1)
            category.selectorSetter([...category.selected,{id:target.id,name:children,count:1}]);
        else
            category.selectorSetter(category.selected.toSpliced(T,1));
    };
    
    return (
        <div className={`flex flex-col justify-center items-center border ${typeof (category.selected.find((v)=>{return v.id==target.id}))!=='undefined' ? 'bg-slate-100' : ''}`}>
            <IconButton onClick={()=>{
                if (category.category.category[link].category.length > 0) category.categorySetter(category.category.category[link]);
                else select();
            }} className="w-full">{icon}</IconButton>
            {children}
        </div>
    );
}
function CategoryLayout({children}) {
    const category = useContext(CategoryContext);
    
    return (
        <>
            <div className="p-3">
                <IconButton variant="soft" onClick={()=>{category.categorySetter(category.defaultCategory)}}><MdKeyboardArrowLeft/> Back</IconButton> {category.category.name}
                <div className="grid grid-cols-3 grid-rows-3">
                    {children}
                </div>
            </div>
        </>
    );
}

const CategoryContext = createContext({category:'',categories:[],selected: [], categorySetter:null,selectorSetter:null});
export default function Order() {
    const startCategory = useRef([]);
    const [category, setCategory] = useState([]);
    const [selected, setSelected] = useState([]);
    const navigate = useNavigate();

    const [_rerender,rerender] = useState(false);
    const [isLoading, setLoading] = useState(false);

    const normalizeSelectedArray = (arr) => {
        let newArr = [];
        arr.forEach((v,ind)=>{
            for (let i = 0; i < v.count; i++) {
                newArr.push(v.name);
            }
        });
        return newArr;
    };
    const sendOrderRequest = async () => {
        console.log(JSON.stringify(normalizeSelectedArray(selected)));
        // return;
        setLoading(true);
        if (!(await checkLogin())) {
            navigate('/');
            return;
        }
        const res = await (await fetch(EntryPoint+"/order/new?foods="+`${JSON.stringify(normalizeSelectedArray(selected))}`, {
            method:'get',
            headers:{"Content-type":"application/json"}, credentials: 'include'
        })).json();
        setLoading(false);
        setSelected([]);
    };

    useEffect(()=>{
        (async ()=>{
            setLoading(true);
            const res = (await fetch(EntryPoint+"/category/list",{method:'get',headers:{"Content-type":"application/json"},credentials: 'include'}));
            if (res.status != 200) return;
            const categories = await res.json();
            startCategory.current = {name:'Main',category:categories};

            setLoading(false);
            setCategory({id:-1,name:'Main',category:categories});
        })();
    },[]);
    
    return (
        <> 
            <CategoryContext.Provider value={{category:category,selected: selected, categorySetter: setCategory, selectorSetter: setSelected, defaultCategory: startCategory.current}}>
                <div className="flex flex-col" style={{'gap':'8px'}}>
                    <CategoryLayout>
                        {typeof (category.category) !== 'undefined' ? category.category.map((c,i)=>{
                            return <Category icon={c.name} link={i} target={c}>{c.name}</Category>
                        }) : ''}
                    </CategoryLayout>
                    {isLoading ? <LinearProgress/> : ''}
                    <Table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Count</th>
                                <th>Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selected.map((sel,i)=>{
                                return (
                                    <tr key={i}>
                                        <td>{i}</td>
                                        <td>{sel.name}</td>
                                        <td>
                                            <div className="flex" style={{'gap':'4px'}}>
                                                {sel.count} 
                                                <button className="border" style={{'width':'18px','borderRadius':'4px'}} onClick={()=>{sel.count++; rerender(!_rerender);}}>+</button>
                                                <button className="border" style={{'width':'18px','borderRadius':'4px'}} onClick={()=>{sel.count--; if (sel.count <= 0) setSelected(selected.toSpliced(i,1)); rerender(!_rerender);}}>-</button>
                                            </div>
                                        </td>
                                        <td className="flex items-center text-center">0 <BiEuro/></td>
                                        <td>

                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                    <div>
                        <Button onClick={sendOrderRequest}>Make order</Button>
                    </div>
                </div>
            </CategoryContext.Provider>
        </>
    );
}