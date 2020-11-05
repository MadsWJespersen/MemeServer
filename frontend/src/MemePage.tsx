import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Icon, IconButton } from 'rsuite';
import axios from 'axios';
import { MemeDisplayer } from './MemeDisplayer';
import {  settings, useMemeStackState } from './State';
import { Votebuttons } from './VoteButtons';

const MemeControleButton : React.FC<{isAllowed:boolean,className:string,isRight:boolean,onClick():void}> = (props) => {
    const iconToUse = <Icon icon={props.isRight ? "arrow-right" : "arrow-left"} />; 
    
    var button;
    if(props.isAllowed){
        button =  
        <IconButton className={props.className} icon ={iconToUse} appearance="primary" onClick={props.onClick} placement={props.isRight ? "right" : "left"}>
            {props.isRight ? "forward" : "back"}
        </IconButton>
    } else {
        button =  
        <IconButton className={props.className} disabled icon ={iconToUse} appearance="primary" onClick={props.onClick} placement={props.isRight ? "right" : "left"}>
             {props.isRight ? "forward" : "back"}
        </IconButton>
    }
    return button;
}

const MemePage :React.FC<settings & {isLoggedIn:boolean,token:string}> = (props) =>{
    
    const CHANCE_OF_TOPTEXT = 75;
    const CHANCE_OF_SOUND = 25;
    const chance_OF_BOTTOMTEXT = 75;
    
    const {memeCanvasState,memeStackPointer,canGoBack,canGoForward,memeVote,visualVote,toptextVote,bottomtextVote,soundVote,setMemeVote,setVisualVote,setToptextVote,setBottomtextVote,setSoundVote,append,goBack,goForward} = useMemeStackState();

    async function getResourceOnChance(fetchURL:string,chance:number):Promise<{id:number,votes:number,data:string}>{
        if( Math.floor(Math.random() * 100) < chance){
            return fetch(fetchURL,{method:'GET'})
            .then(response => response.json())
        }else {
            return {id:0, votes:0, data:""};
        }
    }

    function handleVote(type:string,ids:number[]){
        return function(upvote:boolean){
            let formdata = new FormData();
            formdata.append("type",type);
            formdata.append("upvote",JSON.stringify(upvote));
            
            for(var i = 0 ; i < ids.length; i++){
                formdata.append("ids",ids[i].toString());
            }
            console.log(window.location.protocol + '//' + window.location.hostname +`/vote/`);
            axios.post(window.location.protocol + '//' + window.location.hostname +`/vote/`,formdata, {
                headers: {
                  'Content-Type' : 'multipart/form-data',
                  'auth' : props.token
                } 
            })
            .then(response => {
            });
        }
    }

    async function getRandom(){
        const visualResource = await getResourceOnChance(`${window.location.href}/random/visual`,100);
        const soundResource = await getResourceOnChance(`${window.location.href}/random/sound`,CHANCE_OF_SOUND);
        const toptextResource = await getResourceOnChance(`${window.location.href}/random/toptext`,CHANCE_OF_TOPTEXT);
        const bottomtextResource = await getResourceOnChance(`${window.location.href}/random/bottomtext`,chance_OF_BOTTOMTEXT);
        append(
            {
                toptext:toptextResource.data,
                toptextID:toptextResource.id,
                toptextVotes:visualResource.votes,
                bottomtext:bottomtextResource.data,
                bottomtextID:bottomtextResource.id,
                bottomtextVotes:bottomtextResource.votes,
                visualFileURL:visualResource.data,
                visualFileID:visualResource.id,
                visualVotes:visualResource.votes,
                soundFileURL:soundResource.data,
                soundFileID:soundResource.id,
                soundVotes:soundResource.votes,
                isGif:visualResource.data.endsWith('.gif')
            },
            {
                meme:undefined,
                visual:undefined,
                toptext:undefined,
                bottomtext:undefined,
                sound:undefined
            }
        );
    }

    var memeIds = [memeCanvasState.visualFileID];
    if (memeCanvasState.toptext) memeIds.push(memeCanvasState.toptextID);
    if (memeCanvasState.bottomtext) memeIds.push(memeCanvasState.bottomtextID);
    if (memeCanvasState.soundFileURL) memeIds.push(memeCanvasState.soundFileID);

    var handleMemeVote = handleVote("meme", memeIds);
    var handleToptextVote = handleVote("toptext",[memeCanvasState.toptextID]);
    var handleBottomtextVote = handleVote("bottomtext",[memeCanvasState.bottomtextID]);
    var handleVisualVote = handleVote("visual",[memeCanvasState.visualFileID]);
    var handlesoundVote = handleVote("sound",[memeCanvasState.soundFileID]);

    var voteList = (
        <div className="vote-component-container">
            <li key={0} className="vote-component">
                <Votebuttons state={visualVote} voteCount={memeCanvasState.visualVotes} setVote={setVisualVote} isLoggedIn={props.isLoggedIn} size="small-vote" vote={handleVisualVote}/>
                <h3>Visual</h3>
            </li>
            {memeCanvasState.toptext ? 
                <li key={1} className="vote-component" >
                    <Votebuttons state={toptextVote} voteCount={memeCanvasState.toptextVotes} setVote={setToptextVote} isLoggedIn={props.isLoggedIn} size="small-vote" vote={handleToptextVote}/>
                    <h3>Toptext</h3>
                </li>
            : null
            }
            {memeCanvasState.bottomtext ?
                <li key={2} className="vote-component">
                    <Votebuttons state={bottomtextVote} voteCount={memeCanvasState.bottomtextVotes} setVote={setBottomtextVote} isLoggedIn={props.isLoggedIn} size="small-vote" vote={handleBottomtextVote}/>
                    <h3>Bottomtext</h3>
                </li>
            : null
            }
            {memeCanvasState.soundFileURL ?
                <li key={3} className="vote-component">
                    <Votebuttons state={soundVote} voteCount={memeCanvasState.soundVotes} setVote={setSoundVote} isLoggedIn={props.isLoggedIn} size="small-vote" vote={handlesoundVote}/>
                    <h3>Sound</h3>
                </li>
            : null
            }
        </div>     
    );

    return (
        <div>
            <div className="Meme-upload-bar"> 
                <h3>
                    Think these memes are stinky? 
                    <Link to="/Upload/Meme" className="Signup-link">
                        upload your own
                    </Link>
                </h3>
            </div>
            {props.advancedMode ? voteList : null}
            <div className="random-container">
                <Votebuttons state={memeVote} voteCount={0} setVote={setMemeVote} isLoggedIn={props.isLoggedIn} size="normal-vote" vote={handleMemeVote}/>       
                <MemeDisplayer className="Meme-container" memeState={memeCanvasState}>
                    <div className="Meme-button-container">
                        <MemeControleButton className="Meme-button" isAllowed={canGoBack} isRight={false} onClick={goBack} />
                        <Button className="Meme-button" appearance="primary" onClick={getRandom}>
                            New meme
                        </Button>    
                        <MemeControleButton className="Meme-button" isAllowed={canGoForward} isRight={true} onClick={goForward} />
                    </div>
                    <h1>{memeStackPointer}</h1>
                </MemeDisplayer>
            </div>
        </div>
    );
}

export default MemePage;