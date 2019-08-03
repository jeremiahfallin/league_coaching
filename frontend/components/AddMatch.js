import React, { useState, useEffect } from "react";
import Form from "./styles/Form";
import Router from "next/router";
import Error from "./ErrorMessage";
import styled from "styled-components";
import PlayerInfo from "./PlayerInfo";

const Division = styled.div`
  float: ${props => props.direction};
  width: 45%;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
`;

const GetMatchButton = styled.button`
  width: auto;
  background: ${props => props.theme.phthalo};
  color: white;
  border: 0;
  font-size: 2rem;
  font-weight: 600;
  padding: 0.5rem 1.2rem;
`;

function AddMatch() {
  const baseStats = {
    summonerName: "",
    champion: "",
    kills: 0,
    deaths: 0,
    assists: 0,
    damage: 0,
    gold: 0
  };

  const [loading, setLoading] = useState(false);
  const [matchID, setMatchID] = useState(0);
  const [blueTop, setBlueTop] = useState(baseStats);
  const [blueJungle, setBlueJungle] = useState(baseStats);
  const [blueMid, setBlueMid] = useState(baseStats);
  const [blueCarry, setBlueCarry] = useState(baseStats);
  const [blueSupport, setBlueSupport] = useState(baseStats);
  const [redTop, setRedTop] = useState(baseStats);
  const [redJungle, setRedJungle] = useState(baseStats);
  const [redMid, setRedMid] = useState(baseStats);
  const [redCarry, setRedCarry] = useState(baseStats);
  const [redSupport, setRedSupport] = useState(baseStats);

  const callBackendAPI = async match => {
    const response = await fetch(
      `http://localhost:4444/addmatch?match=${match}`
    );
    if (response.status !== 200) {
      throw Error(body.message);
    }

    const body = await response.json();
    const data = body["data"];

    // 3102504145

    const setLane = i => {
      const {
        kills,
        deaths,
        assists,
        totalDamageDealtToChampions: damage,
        goldEarned: gold
      } = data["participants"][i]["stats"];
      return {
        summonerName: "",
        champion: data["participants"][i]["champion"],
        kills: Number(kills),
        deaths: Number(deaths),
        assists: Number(assists),
        damage: Number(damage),
        gold: Number(gold)
      };
    };

    setBlueTop(setLane(0));
    setBlueJungle(setLane(1));
    setBlueMid(setLane(2));
    setBlueCarry(setLane(3));
    setBlueSupport(setLane(4));
    setRedTop(setLane(5));
    setRedJungle(setLane(6));
    setRedMid(setLane(7));
    setRedCarry(setLane(8));
    setRedSupport(setLane(9));
  };

  const getMatch = () => {
    callBackendAPI(matchID);
  };

  return (
    <Form
      onSubmit={async e => {
        e.preventDefault();
        callBackendAPI("5555");
        Router.push({
          pathname: "/addmatch"
        });
      }}
    >
      <Column>
        <GetMatchButton type="button" onClick={getMatch}>
          Retrieve Match
        </GetMatchButton>
        <label htmlFor="matchID">
          <input
            type="number"
            id="matchID"
            name="matchID"
            placeholder="Match ID"
            required
            onChange={e => setMatchID(e.target.value)}
          />
        </label>
      </Column>

      <fieldset disabled={loading} aria-busy={loading}>
        <Division direction="left">
          Blue Side
          <fieldset player="true">
            <legend>Top</legend>
            <PlayerInfo playerData={blueTop} setPlayerData={setBlueTop} />
          </fieldset>
          <fieldset player="true">
            <legend>Jungle</legend>
            <PlayerInfo playerData={blueJungle} setPlayerData={setBlueJungle} />
          </fieldset>
          <fieldset player="true">
            <legend>Mid</legend>
            <PlayerInfo playerData={blueMid} setPlayerData={setBlueMid} />
          </fieldset>
          <fieldset player="true">
            <legend>Carry</legend>
            <PlayerInfo playerData={blueCarry} setPlayerData={setBlueCarry} />
          </fieldset>
          <fieldset player="true">
            <legend>Support</legend>
            <PlayerInfo
              playerData={blueSupport}
              setPlayerData={setBlueSupport}
            />
          </fieldset>
          <button type="submit">Submit</button>
        </Division>
        <Division direction="right">
          Red Side
          <fieldset player="true">
            <legend>Top</legend>
            <PlayerInfo playerData={redTop} setPlayerData={setRedTop} />
          </fieldset>
          <fieldset player="true">
            <legend>Jungle</legend>
            <PlayerInfo playerData={redJungle} setPlayerData={setRedJungle} />
          </fieldset>
          <fieldset player="true">
            <legend>Mid</legend>
            <PlayerInfo playerData={redMid} setPlayerData={setRedMid} />
          </fieldset>
          <fieldset player="true">
            <legend>Carry</legend>
            <PlayerInfo playerData={redCarry} setPlayerData={setRedCarry} />
          </fieldset>
          <fieldset player="true">
            <legend>Support</legend>
            <PlayerInfo playerData={redSupport} setPlayerData={setRedSupport} />
          </fieldset>
        </Division>
      </fieldset>
    </Form>
  );
}

export default AddMatch;
