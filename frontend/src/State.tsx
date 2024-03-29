import Axios from 'axios';
import { EffectCallback, useEffect, useState } from 'react';
import { apiHost, protocol } from './App';
import {setCookie, getCookie} from './cookies'

export enum Upvote {
  Upvote,
  Downvote,
  Unvote
}

export type profilePic = {
  profilePicURL: string;
};

export type Email = {
  Email: string;
};

export type userstate = {
  isLoggedIn:boolean;
  token:string;
  Username:string;
  profilePicURL:string;
  Email:string;
}

export type login = (userState:userstate) =>  void;


export type signout = () => void

export const useUserState = () => {
  const [userState, setUserState] = useState({
    isLoggedIn: false,
    token: '',
    Username: 'LonelyCrab',
    profilePicURL: 'default.jpg',
    Email: '',
  });

  function login(userState: userstate) {
    setUserState(userState);
  }

  function signout() {
    Axios.post(`${protocol}://${apiHost}/Users/logout`).then(_ => {
      setUserState({
        isLoggedIn: false,
        token: '',
        Username: 'LoneliestCrab',
        Email: '',
        profilePicURL: 'default.jpg',
      });
    }).catch(error => {
    })
  }
  return { userState, login, signout };
};

export type MemeCanvasState = {
  [index: string]: string | number | boolean;
  toptext: string;
  toptextID: number;
  toptextVotes: number;
  bottomtext: string;
  bottomtextID: number;
  bottomtextVotes: number;
  visualFileURL: string;
  visualFileID: number;
  visualVotes: number;
  soundFileURL: string;
  soundFileID: number;
  soundVotes: number;
  isGif: boolean;
};

export const useMemeCanvasState = () => {
  const [memeCanvasState, setMemeCanvasState] = useState<MemeCanvasState>({
    toptext: '',
    toptextID: 0,
    toptextVotes: 0,
    bottomtext: '',
    bottomtextID: 0,
    bottomtextVotes: 0,
    visualFileURL: '',
    visualFileID: 0,
    visualVotes: 0,
    soundFileURL: '',
    soundFileID: 0,
    soundVotes: 0,
    isGif: false,
  });
  return { memeCanvasState, setMemeCanvasState };
};

export type VoteState = {
  upvoted: boolean;
  downvoted: boolean;
  voteCount: number;
};

export type MemeVoteState = {
  [index: string]: Upvote;
  meme: Upvote;
  visual: Upvote;
  toptext: Upvote;
  bottomtext: Upvote;
  sound: Upvote;
};

export const useMemeStackState = () => {
  const { memeCanvasState, setMemeCanvasState } = useMemeCanvasState();
  const [voteState, setVoteState] = useState<MemeVoteState>({
    meme: Upvote.Unvote,
    visual: Upvote.Unvote,
    toptext: Upvote.Unvote,
    bottomtext: Upvote.Unvote,
    sound: Upvote.Unvote,
  });

  const [memeCanvasStackState, setMemCanvaseStackState] = useState([memeCanvasState]);
  const [memeVoteStackState, setMemeVoteStackState] = useState([voteState]);

  const [memeStackPointer, setMemeStackPointer] = useState(0);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setcanGoForward] = useState(false);

  //keep current meme/vote state in sync with the current pointer
  useEffect(() => {
    setMemeCanvasState(memeCanvasStackState[memeStackPointer]);
    const copy = { ...memeVoteStackState[memeStackPointer] };
    setVoteState(copy);
  }, [memeStackPointer, memeCanvasStackState, memeVoteStackState, setMemeCanvasState]);

  
  //enable/disable going backwards/forwards
  useEffect(() => {
    setCanGoBack(memeStackPointer !== 0);
  }, [memeStackPointer]);

  useEffect(() => {
    setcanGoForward(memeStackPointer !== memeCanvasStackState.length - 1);
  }, [memeStackPointer, memeCanvasStackState.length]);

  function append(newMemeCanvasState: MemeCanvasState, newMemeVoteState: MemeVoteState) {
    if (memeCanvasStackState[0].visualFileURL === '') {
      setMemCanvaseStackState([newMemeCanvasState]);
      setMemeVoteStackState([newMemeVoteState]);
    } else {
      const copy = [...memeCanvasStackState, newMemeCanvasState];
      setMemCanvaseStackState(copy);

      const copy2 = [...memeVoteStackState, newMemeVoteState];
      copy2[memeStackPointer] = voteState;
      setMemeVoteStackState(copy2);

      setMemeStackPointer(copy.length - 1);
    }
  }

  function vote(type: string) {
    return function (isUpvote: Upvote) {
      const copy = { ...voteState };
      copy[type] = isUpvote;
      setVoteState(copy);
    };
  }

  function goBack() {
    const copy2 = [...memeVoteStackState];
    copy2[memeStackPointer] = voteState;
    setMemeVoteStackState(copy2);
    setMemeStackPointer(memeStackPointer - 1);
  }

  function goForward() {
    const copy2 = [...memeVoteStackState];
    copy2[memeStackPointer] = voteState;
    setMemeVoteStackState(copy2);
    setMemeStackPointer(memeStackPointer + 1);
  }

  return {
    memeCanvasState,
    memeCanvasStackState,
    memeStackPointer,
    canGoBack,
    canGoForward,
    voteState,
    setMemeCanvasState,
    vote,
    append,
    goBack,
    goForward,
  };
};

export const useMountEffect = (fun: EffectCallback) => useEffect(fun, []);

export const useConfig = () => {
    const defaultConfig = {
      advancedMode:false,
      soundChance:25,
      toptextChance:75,
      bottomtextChance:75
    }
    const raw = getCookie("config")
    const config = raw ? JSON.parse(raw) : defaultConfig;
    const [advancedMode, setAdvancedMode] = useState(config.advancedMode)
    const [soundChance, setsoundChance] = useState(config.soundChance)
    const [toptextChance, settoptextChance] = useState(config.toptextChance)
    const [bottomtextChance, setbottomtextChance] = useState(config.bottomtextChance)

    useEffect(() => {
      setCookie("config",
      JSON.stringify({
        advancedMode:advancedMode,
        soundChance:soundChance,
        toptextChance:toptextChance,
        bottomtextChance:bottomtextChance
      }));
    },[advancedMode,soundChance,toptextChance,bottomtextChance]);
    
    return {
      advancedMode,
      soundChance,
      toptextChance,
      bottomtextChance,
      setAdvancedMode,
      setsoundChance,
      settoptextChance,
      setbottomtextChance
    }
}