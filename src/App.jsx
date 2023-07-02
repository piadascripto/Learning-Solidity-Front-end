import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from '/src/WevePortal_ABI.json'

const TWITTER_HANDLE = "piadascripto"
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`

const contractAddress = "0xFb0a318ae5858E2f341afdD7959D686e0AcA95bd";
const contractABI = abi.abi;

export default function App() {

  const [currentAccount, setCurrentAccount] = useState("");
  const [waves, setTotalWaves] = useState();
  const [allWaves, setAllWaves] = useState([]);

  async function checkIfWalletIsConnected() {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Please install MetaMask!");
        return;
      }

    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length > 0) {
        setCurrentAccount(accounts[0]);
    }
    } catch (error) {
      console.log(error);
    }
  }


  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Please install MetaMask!!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const getAllWaves = async () => {
  const { ethereum } = window;

  try {
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      const waves = await wavePortalContract.getAllWaves();
      const wavesCleaned = waves.map(wave => {
        return {
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message,
        };
      });

      setAllWaves(wavesCleaned);
    } else {
      console.log("Didn't find your wallet!");
    }
  } catch (error) {
    console.log(error);
  }
};

useEffect(() => {
    checkIfWalletIsConnected();
    getAllWaves();
  }, []);
  
useEffect(() => {
  let wavePortalContract;

  const onNewWave = (from, timestamp, message) => {
    console.log("NewWave", from, timestamp, message);
    setAllWaves(prevState => [...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };

  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    wavePortalContract.on("NewWave", onNewWave);
  }

  return () => {
    if (wavePortalContract) {
      wavePortalContract.off("NewWave", onNewWave);
    }
  };
}, []);


const [userMessage, setUserMessage] = useState("");
  
const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();


        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        let count = await wavePortalContract.getTotalWaves();
        console.log("Retriving number of luck wishes...", count.toNumber());
        setTotalWaves(count.toNumber());

        const waveTxn = await wavePortalContract.wave(userMessage);
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mining -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Lucks wishes retrived...", count.toNumber());
        
      } else {
        console.log("Objeto Ethereum não encontrado!");
      }
    } catch (error) {
      console.log(error)
    }
  }
  
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <img  height="300px" src="https://codeweek-s3.s3.amazonaws.com/event_picture/output_JFDiRs.gif"></img>
        <div className="header">
           Learning to code Solidity using an Ipad
        </div>
        <div className="bio">
           {!currentAccount && (
           <p>Connect a wallet and help me to surf my learning curve</p>
           )}
        </div>
        {currentAccount && (
        <>
        <input
           type="text"
           value={userMessage}
           onChange={(e) => setUserMessage(e.target.value)}
        placeholder="Type your message here"
        />
        <button className="waveButton" onClick={wave}>
        Wish me luck coding with an iPad 🍀
        </button>
        </>
        )}
        {currentAccount && (
        <div class="wavesContainer">
           <p>Who has wished me luck: {waves}</p>
           {allWaves.map((wave, index) => {
           return (
           <div key={index}>
              <div>Endereço: {wave.address}</div>
              <div>Data/Horário: {wave.timestamp.toString()}</div>
              <div>Mensagem: {wave.message}</div>
           </div>
           )
           })}
        </div>
        )}
        {!currentAccount && (
        <button className="waveButton" onClick={connectWallet}>
        Connect Metamask 🦊
        </button>
        )}
        
    </div>
<div className="footer-container">
          
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`Created by @${TWITTER_HANDLE}`}</a>
        </div>
  </div>
    
  );
}
