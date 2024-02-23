import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios'
import React, {useState, useEffect} from 'react';

// explicitly setting base part of the URL for the requests made through this axios instance
const api = axios.create({
  baseURL: 'http://localhost:5001',
});


function CoinBlock({ name, price, volume, change}) {
  return (
  <div className="card">
    <div className="card-body">
      <h5 className="card-title">{name}</h5>
      <h6 className ="card-subtitle mb-2 text-muted">{price}$</h6>
      <div className="row">
        <div className="col-6">
          <h6>volume:</h6>
          <p>{volume}$</p>
        </div>
        <div className="col-6">
          <h6>change:</h6>
          <p className={parseFloat(change) > 0 ? "text-success" : "text-danger" }>{change}%</p>
        </div>
      </div>
    </div>  
  </div>
  );
}

function App() {
  // "prices" state variable holds data fetched from the CoinCap in the format of an array
  const [prices, setPrices] = useState([]);

  // hash that uniquely identifies the last successfully fetched instance of data 
  let eTag = '';

  // side effect for fetching data, runs once after the initial render 
  useEffect(() => {
    const fetchPrices = () => {
      // add eTag as a header to the request to the endpoint 
      api.get('/api/prices', { headers: {'if-none-match': eTag} })
         .then(response => { 
            setPrices(response.data);
            console.log("response: ", response.headers);
            const newETag = response.headers['etag'];
            if (newETag) {
              eTag = newETag;
              console.log('newETag');
            }
          })
          .catch(error => {
            if (error.response && error.response.status === 304) {
              console.log("Not modified");
            } else {
              console.log("Error: ", error);
            }
          });
    }     
    
    fetchPrices();

    const intervalId = setInterval(() => {
      fetchPrices();
      console.log("fetched again...");
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  if (prices.length < 1) {
    return <div>Loading...</div>
  }

  const dataArray = prices.map(coin => ({
    name: coin.name,
    price: coin.priceUsd ? parseFloat(coin.priceUsd).toFixed(8) : '-',
    volume: coin.volumeUsd24Hr ? parseFloat(coin.volumeUsd24Hr).toFixed(5) : '-',
    change: coin.changePercent24Hr ? parseFloat(coin.changePercent24Hr).toFixed(8) : '-'
  }));

  return (
    <div className="d-flex flex-column justify-content-center mt-2">
      <div className="d-flex justify-content-center">
        <h2>Cryptocurrency Realtime Prices</h2>
      </div>

      <div className="container mt-3">
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {dataArray.map( (data, index) => (
            <div className="col" key={index}> {/* Use just "col" here */}
              <CoinBlock 
                name = {data.name}
                price = {data.price}
                volume = {data.volume}
                change = {data.change}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
