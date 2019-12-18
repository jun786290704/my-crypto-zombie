import React, { Component } from 'react';
import MyWeb3 from './MyWeb3'
import ZombiePreview from "./ZombiePreview"
import './zombiePreview.css'
import moment from "moment"

class NewZombie extends Component {
    constructor(props) {
        super(props);
        const searchParams = new URLSearchParams(this.props.location.search)
        const id = searchParams.get('id')   
        this.state = {
            targetId:id ,
            targetZombie:{},
            myZombies:[],
            myZombie:{},
            myZombieId:'',
            active: {},
            buttonTxt:'',
            modalDisplay:'none'
        }
        this.selectZombie = this.selectZombie.bind(this)
        this.zombieAttack = this.zombieAttack.bind(this)
    }
    componentDidMount(){
        let that = this
        let ethereum = window.ethereum
        if (typeof  ethereum !== 'undefined' || (typeof window.web3 !== 'undefined')) {
            MyWeb3.init().then(function(res){
                that.getZombie(that.state.targetId)
                that.getMyZombies()
            })
        }else {
            alert('You have to install MetaMask !')
        }
    }
    
    getZombie(zombieId){
        let that = this
        MyWeb3.zombies(zombieId).then(function (result) {
            that.setState({targetZombie:result})
        })
    }
    getMyZombies(){
        let that = this
        MyWeb3.getZombiesByOwner().then(function(zombies){
            if(zombies.length > 0){
                for(let i=0;i<zombies.length;i++){
                    MyWeb3.zombies(zombies[i]).then(function (result) {
                        let _zombies = that.state.myZombies
                        result.zombieId = zombies[i]
                        if(result.readyTime === 0 || moment().format('X')>result.readyTime){
                            _zombies.push(result)
                        }
                        that.setState({myZombies:_zombies})
                    })
                }
            }
        })
    }
    selectZombie = index => {
        var _active = this.state.active
        var prev_active = _active[index]
        for(var i=0;i<this.state.myZombies.length;i++){
            _active[i] = 0
        }
        _active[index] = prev_active === 0 || prev_active === undefined ? 1 : 0
        this.setState({
            active:_active,buttonTxt:'用'+this.state.myZombies[index].name,
            myZombie:this.state.myZombies[index],
            myZombieId:this.state.myZombies[index].zombieId
        })
    }

    zombieAttack(){
        if(this.state.myZombie !== undefined){
            this.setState({modalDisplay:''})
            MyWeb3.attack(this.state.myZombieId,this.state.targetId).then(function(receipt){
                console.log(receipt)
                window.location.reload()
            })
        }
    }
    render() { 
        if(this.state.myZombies.length>0) {
            return ( 
                <div className="App zombie-attack">
                <div
                    className="modal"
                    style={{
                        display:this.state.modalDisplay
                    }}
                >
                    <div className='battelArea'>
                        <div className='targetZombie'>
                            <ZombiePreview zombie={this.state.targetZombie}></ZombiePreview>
                        </div>
                        <div className='vs'>
                            VS
                        </div>
                        <div className='myZombie'>
                            <ZombiePreview zombie={this.state.myZombie}></ZombiePreview>
                        </div>
                    </div>

                </div>
                    <div  className="row zombie-parts-bin-component" authenticated="true" lesson="1" lessonidx="1">
                        <div  className="game-card home-card target-card" >
                            <div className="zombie-char">
                                <ZombiePreview zombie={this.state.targetZombie}></ZombiePreview>
                                <div className="hide">
                                    <div className="card-header bg-dark hide-overflow-text">
                                        <strong ></strong></div>
                                    <small className="hide-overflow-text">CryptoZombie第一级</small>
                                </div>
                            </div>
                        </div>
                        <div className="zombie-detail">
                            <div className="flex">
                                {this.state.myZombies.map((item,index)=>{
                                    var name = item.name
                                    var level = item.level
                                    return(
                                        <div className="game-card home-card selectable" key={index} active={this.state.active[index] || 0} onClick={() => this.selectZombie(index)} >
                                            <div className="zombie-char">
                                            <ZombiePreview zombie={item}></ZombiePreview>
                                                <div className="zombie-card card bg-shaded">
                                                    <div className="card-header bg-dark hide-overflow-text">
                                                        <strong>{name}</strong>
                                                    </div>
                                                    <small className="hide-overflow-text">CryptoZombie{level}级</small>
                                                </div>
                                            </div>
                                        </div>  
                                    )
                                })}
                            </div>
                            <button className="attack-btn" onClick={this.zombieAttack}>
                                <span>
                                    {this.state.buttonTxt}干它！
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            );
        }else{
            return(
                <div>没有能干它的僵尸</div>
            )
        }
    }
}
 
export default NewZombie;