import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, ArrowRight } from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

import login_handler from "./Login_page.js";


export function Login() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");


  const handleLogin = (e: React.FormEvent) => {

    e.preventDefault();


    // call js function
    const message = login_handler(username, password);


    // show message
    setResult(message);


    // wait 2 seconds then go dashboard
    setTimeout(() => {

      navigate("/app");

    }, 2000);

  };


  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-8">


      <div className="w-full max-w-md">


        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Car className="w-8 h-8 text-white" />
          </div>


          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Parking Management System
          </h1>


          <p className="text-gray-600">
            Please login to access the system
          </p>


        </div>



        <Card>

          <CardHeader>

            <CardTitle>
              Login
            </CardTitle>


            <CardDescription>
              Enter your credentials to continue
            </CardDescription>


          </CardHeader>



          <CardContent>


            <form onSubmit={handleLogin} className="space-y-4">



              <div className="space-y-2">

                <Label htmlFor="username">
                  Username
                </Label>


                <Input

                  id="username"

                  type="text"

                  placeholder="Enter username"

                  value={username}

                  onChange={(e)=>setUsername(e.target.value)}

                  required

                />

              </div>





              <div className="space-y-2">

                <Label htmlFor="password">
                  Password
                </Label>


                <Input

                  id="password"

                  type="password"

                  placeholder="Enter password"

                  value={password}

                  onChange={(e)=>setPassword(e.target.value)}

                  required

                />


              </div>





              <Button type="submit" className="w-full">


                Login

                <ArrowRight className="w-4 h-4 ml-2" />


              </Button>



            </form>



          </CardContent>


        </Card>




        <div className="mt-6 text-center">


          <p className="text-sm text-gray-500">

            Demo credentials: admin / admin

          </p>


          <p>

            {result}

          </p>


        </div>



      </div>


    </div>

  );

}