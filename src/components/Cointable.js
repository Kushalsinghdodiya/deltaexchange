import React, { useState, useEffect } from 'react';
import './cointable.css';



export default function Cointable() {

    const [coinsData, setCoinsData] = useState([]);
    const [coinsSymbols, setcoinsSymbols] = useState([]);
    const [prices, setPrices] = useState([]);
    const [isloading,setLoading]=useState(true);
    let resdata = [];


    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = async () => {

        await fetch("https://api.delta.exchange/v2/products")
            .then((as) => as.json())
            .then((dt) => {
                let data = dt.result.splice(0, 10);
                setCoinsData([...data]);
                data.map((dt) => coinsSymbols.push(dt.symbol));
                setcoinsSymbols([...coinsSymbols]);
            }).then(() => {
                console.log("running socket")
                let socket = new WebSocket("wss://production-esocket.delta.exchange");
                socket.onopen = function () {
                    //Subscribe to the channel
                    console.log("running socket open")
                    socket.send(
                        JSON.stringify({
                            type: "subscribe",
                            payload: {
                                channels: [
                                    {
                                        name: "v2/ticker",
                                        symbols: coinsSymbols,
                                    },
                                ],
                            },
                        })
                    );


                };


                socket.onmessage = function (msg) {

                    let res = JSON.parse(msg.data);

                    if (res.mark_price !== undefined) {
                        resdata.push(res.mark_price);
                        setLoading(false);

                    }else{
                        setLoading(true);
                    }
                    setPrices([...resdata]);
                   

                };

                socket.onclose = function (event) {
                    if (event.wasClean) {
                        console.log(
                            `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
                        );
                    } else {

                        alert("[close] Connection died");
                    }
                };

                socket.onerror = function (error) {
                    alert(`[error] ${error.message}`);
                };



            })




    }


    return (


        <>

        {isloading ? <div className="loading">Loading&#8230;</div>:
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-sm-12 '>
                        <table className="table coins_table table-bordered mt-5">
                            <thead>
                                <tr>
                                    <th scope="col">Symbol</th>
                                    <th scope="col">Description</th>
                                    <th scope="col">Underlying Asset</th>
                                    <th scope="col">Mark Price</th>
                                </tr>
                            </thead>
                            <tbody>

                                {coinsData.map((dq, index) => {
                                    let a = prices.slice(prices.length - coinsData.length, prices.length)
                                    return <tr key={index}>
                                        <th >${dq.symbol}</th>
                                        <td>${dq.description}</td>
                                        <td>${dq.underlying_asset.symbol}</td>
                                        <td > <span style={{ fontSize: '18px' }} className="badge badge-success">${a[index]}</span></td>
                                    </tr>
                                })}


                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        }
        </>
    );
}
