import React, { Component, useState } from 'react';
import Web3 from 'web3'
import './css/style.css';
import BattleshipToken from '../abis/BattleshipToken.json'
import ship from '../ship.png'
import git from './img/github.svg'
import './fonts/Residu/fonts.css';
import main from './js/game.js';
import blckchn from './img/blockchain.png';

function MyPopup({ buttonLabel, children }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <button className="popbutton" onClick={handleClick}>
        {buttonLabel}
      </button>
      {isOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="close-btn" onClick={handleClick}>
              x
            </button>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

function TokenPopup({ buttonLabel, id, name})  {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <img className="tokens" src={buttonLabel} onClick={handleClick} alt="😔"></img>
      {isOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="close-btn" onClick={handleClick}>
              x
            </button>
            <p className="manual-titles">Do you want to download this NFT?</p>
              <img key={id} src={buttonLabel} alt="😔" className="popuptoken"/>
              <div className="tokenbar">
                <button className="tokenbutton" onClick={() => downloadFile(buttonLabel, name + "token" + id + ".png")}>Yes</button>
                <button className="tokenbutton" onClick={handleClick}>No</button>
              </div>
              <p className="manual-text">This token is listed on blockchain with this link: <br />
                <a href={window.location.origin + '/tokens/' + name + '/token' + id + '.png'}>
                  {window.location.origin + '/tokens/' + name + '/token' + id + '.png'}
                </a>
              </p>
          </div>
        </div>
      )}
    </div>
  );
}

function downloadFile(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
}

class App extends Component {
  
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    // Load smart contract
    const networkId = await web3.eth.net.getId()
    const networkData = BattleshipToken.networks[networkId]
    if(networkData) {
      const abi = BattleshipToken.abi
      const address = networkData.address
      const token = new web3.eth.Contract(abi, address)
      this.setState({ token })
      const totalSupply = await token.methods.totalSupply().call()
      this.setState({ totalSupply })
      // Load Tokens
      let balanceOf = await token.methods.balanceOf(accounts[0]).call()
      for (let i = 0; i < balanceOf; i++) {
        let id = await token.methods.tokenOfOwnerByIndex(accounts[0], i).call()
        let tokenURI = await token.methods.tokenURI(id).call()
        this.setState({
          tokenURIs: [...this.state.tokenURIs, tokenURI]
        })
      }
    } else {
      alert('Smart contract not deployed to detected network.')
    }
  }

  create = async () => {
    let user = this.state.account;
    let id = this.state.tokenURIs.length;
    this.state.token.methods.mint(
      this.state.account,
      window.location.origin + '/tokens/' + user + '/token' + id + '.png'
    )
    .send({ from: this.state.account })
    .on('transactionHash', (hash) => {
      fetch(`http://127.0.0.1:5000/permission?id=${id}&user=${user}`)
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          console.log("minting failed")
        }
      }).then(jsonResponse => {
          console.log(jsonResponse)
        }
      ).catch((err) => console.error(err));
      this.setState({
        TokensWon: [...this.state.TokensWon, 'seabattlecoin'],
        tokenURIs: [...this.state.tokenURIs, '/tokens/' + user.toString() + '/token' + id.toString() + '.png']
      })
    })
  }

  componentDidMount() {
    const result = main();
    this.setState({ mainResult: result });
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      token: null,
      totalSupply: 0,
      tokenURIs: [],
      TokensWon: [],
      mainResult: null
    }
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <div className="navbar-brand col-md-2">
            <img src={ship} width="30" height="30" className="d-inline-block align-top" alt="" />
            &ensp;
            Battleship Tokens
          </div>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small className="text-muted"><span id="account">{this.state.account}</span></small>
            </li>
          </ul>
        </nav>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-computeratible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>SEA BATTLE</title>
        <link href="fonts/Residu/fonts.css" rel="stylesheet" />
        <link href="css/style.css" rel="stylesheet" />
        <div id="matrix" style={{position: 'fixed', left: '20px', top: '50px'}} />
        <div className="wrap">
          <div className="container-fluid mt-5 panel">
            <span>Win Sea Battle game to get the unique token!</span>
          </div>
          <div className="nav-container">
            <nav className="bar">
              <MyPopup buttonLabel="Game Rules">
                <div>
                  <p className="manual-titles">Game Rules</p>
                  <p className="manual-text">
                    Sea Battle is a two-player game, where players take turns guessing the location of their opponent's ships on a map. 
                    In this game, you will play against the computer. <br />
                    Each player places their ships on a 10x10 grid prior to the start of the game. 
                    The goal is to be the first player to successfully hit and sink all of your opponent's ships. 
                    The player who goes first is selected at random.<br />
                    &emsp;When it's your turn, you will choose a coordinate on the enemy's map. 
                    If there is a ship located at the coordinate you choose, it will be marked as <span style={{color: '#c00'}}>"HIT"</span>. 
                    If you sink the ship, the word <span style={{color: '#c00'}}>"SANK"</span> will appear and you will have the opportunity to take another shot. 
                    If the shot misses, the word <span style={{color: '#c00'}}>"MISS"</span> will appear and the turn will pass to your opponent.<br />
                    &emsp;Each player can have a maximum of 10 ships on the map, with the following distribution: one 4-square ship, two 3-square ships, three 2-square ships, and four 1-square ships.
                    The ships can only be placed vertically or horizontally, and there must be at least one empty square between each ship.<br />
                    &emsp;It's important to note that the computer <b>does not</b> use information about player ships to gain an advantage in the game.<br />
                  </p>
                </div>
              </MyPopup>
              <MyPopup buttonLabel="Computer AI">
                <div>
                  <p className="manual-titles">What Makes This Sea Battle AI Stand Out</p>
                  <p className="manual-text"> Unlike other sea battle AI opponents that simply choose coordinates randomly, my AI calculates the point with the highest probability of having a ship. Here's how it works:</p>
                  <p className="manual-list">  1) The AI randomly places unfound ships on free cells, generating multiple scenarios.</p>
                  <p className="manual-list">  2) Based on these scenarios it creates a probability map of the field.</p>
                  <p className="manual-list">  3) The point with the highest probability of having a ship is targeted by computer.</p>
                  <p className="manual-text">  
                    This approach ensures both effectiveness and randomness, making it impossible for the user to exploit any predictable patterns. 
                    Based on my statistics, this AI has a <span style={{color: '#0917d6'}}>60%</span> win rate against other random-based sea battle AI's, which is a remarkable result considering the inherent chaos of the battleship game.
                  </p>
                  <p className="manual-text">  In conclusion, this AI utilizes a strategic approach and gives players a more challenging and engaging experience. So why not give it a try and see how you fare against the AI?</p>
                </div>
              </MyPopup>
              <MyPopup buttonLabel="About Blockchain">
                <div>
                <p className="manual-titles">Here is a simple illustration of how this app works:</p>
                <img className="picture" src={blckchn} alt="😔"/>
                </div>
              </MyPopup>
              <MyPopup buttonLabel="NFT">
                <div>
                  <p className="manual-titles">Non-Fungible Tokens</p>
                </div>
              </MyPopup>
              <MyPopup buttonLabel="Contacts">
                <div>
                  <p className="manual-titles">Contacts</p>
                  <p className="contact-text">This app is made by Alex Kap.<br />
                    <a href="https://github.com/SeldonHZ" style={{color: '#000000'}}>
                      <img className="contacts" src={git} alt="😔" height="60px" width="60px" />
                      My GitHub
                    </a>
                  </p>
                </div>
              </MyPopup>
            </nav>
            <div className="popup-overlay-bg"></div>
          </div>
          <div id ='mintpnl' className="get" hidden>
            <button id="mint" className="popbutton" value={this.state.account} onClick={() => {this.create()}}>GET THE TOKEN</button>
          </div>
          <div className="battlefield">
            <div id="text_top" className="flex text-top">Ship placement</div>
            <div className="flex outer">
              <div className="field field-human">
                <div id="field_human" className="ships" />
              </div>
              <div className="field field-computer" hidden>
                <div id="field_computer" className="ships" />
              </div>
              <div id="instruction" className="instruction">
                <div id="type_placement" className="type-placement-box">
                  1. <span className="link" data-target="random">Random generation</span><br />
                  2. <span className="link" data-target="manually">Your placement (only for Desktop)</span>
                </div>
                <div id="ships_collection" className="ships-collection" hidden>
                  <p>Drag the ships onto the playing field with the mouse. To set the ship vertically, click on it with the right mouse button.</p>
                </div>
              </div>
            </div>
            <div className="service-row">
              <div id="service_text" className="service-text" />
              <button id="play" type="button" className="btn-play" hidden>Play</button>
              <button id="newgame" type="button" className="btn-play btn-newgame" hidden>Continue</button>
            </div>
          </div>
          <div className="blck">
            <p className="manual-titles">Tokens Collected:<span id="result">&nbsp;{this.state.tokenURIs.length}</span></p>
            <div className="tokenblck">
              { this.state.tokenURIs.map((tokenURI, key) => { 
                return(<TokenPopup buttonLabel={tokenURI} id={key} name={this.state.account}/>)
              })}
            </div>
          </div>
        </div>
        <ul className="initial-ships" hidden>
          <li>
            <div id="fourdeck1" className="ship fourdeck" />
            <div id="tripledeck1" className="ship tripledeck tripledeck1" />
            <div id="tripledeck2" className="ship tripledeck tripledeck2" />
          </li>
          <li>
            <div id="doubledeck1" className="ship doubledeck" />
            <div id="doubledeck2" className="ship doubledeck doubledeck2" />
            <div id="doubledeck3" className="ship doubledeck doubledeck3" />
          </li>
          <li>
            <div id="singledeck1" className="ship singledeck" />
            <div id="singledeck2" className="ship singledeck singledeck2" />
            <div id="singledeck3" className="ship singledeck singledeck3" />
            <div id="singledeck4" className="ship singledeck singledeck4" />
          </li>
        </ul>
        <div>{this.state.mainResult}</div>
      </div>
    );
  }
}

export default App;
