import {useContext, useState} from "react";
import {useNavigate} from "react-router-dom";
import Input from "../../components/inputs/input.jsx";
import {validateEmail} from "../../utils/helper.js";
import {UserContext} from "../../context/userContext.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import {API_PATHS} from "../../utils/apiPaths.js";

const Login = ({setCurrenPage}) => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const {updateUser} = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        if(!validateEmail(email)){
            setError("Please enter a valid email address.");
            return;
        }

        if(!password) {
            setError("Please enter your password");
            return;
        }

            setError("");

        try{
            console.log("response");
            const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
                email, password
            });


            const {token} = response.data;

            if(token){
                localStorage.setItem("token", token);
                updateUser(response.data);
                navigate("/dashboard");
            }
        }catch(err){
            if(err.response && err.response.data.message){
                setError(err.response.data.message);
            }else{
                setError("Something went wrong. Please try again later.");
            }
        }

    }
        return(
            <div className={"w-[90vw] md:w-[33vw] p-7 flex flex-col justify-center"}>
                <h3 className={"text-lg font-semibold text-black"}>Welcome back</h3>
                <p className={"text-xs text-slate-700 mt-[5px] mb-6"}>
                    Please enter your details to log in
                </p>

                <form onSubmit={handleLogin}>

                    <Input value={email}
                           onChange={(e)=> setEmail(e.target.value)}
                           label="Email Address"
                           placeholder="john@example.com"
                           type={"text"} />

                    <Input value={password}
                           onChange={({target})=> setPassword(target.value)}
                           label="Password"
                           placeholder="Min 8 Characters"
                           type={"password"} />

                    {
                        error && <p className={"text-red-500 text-xs pb-2.5"}>{error}</p>
                    }

                    <button type={'submit'} className={"btn-primary"}>
                        LOGIN
                    </button>

                    <p className={"text-[13px] text-slate-800 mt-3"}>
                        Don't have an account?{" "}
                        <button className={"font-medium text-primary underline cursor-pointer"}
                        onClick={()=> {
                            setCurrenPage("signup")
                        }}>
                            Sign Up
                        </button>
                    </p>
                </form>
            </div>
        )
    }

export default Login;