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

const Row = styled.div`
  display: flex;
  flex-direction: row;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
`;

const Box = styled.div`
  flex: 1;
  margin: 4px;
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
  const [loading, setLoading] = useState(false);
  const [matchID, setMatchID] = useState(0);
  const [blueTop, setBlueTop] = useState({
    summonerName: "",
    champion: "",
    kills: 0,
    deaths: 0,
    assists: 0,
    damage: 0,
    gold: 0
  });

  const callBackendAPI = async match => {
    const response = await fetch(
      `http://localhost:4444/addmatch?match=${match}`
    );
    if (response.status !== 200) {
      throw Error(body.message);
    }

    const body = await response.json();
    const data = body["data"];
    const {
      kills,
      deaths,
      assists,
      totalDamageDealtToChampions: damage,
      goldEarned: gold
    } = data["participants"][0]["stats"];
    // 3102504145

    setBlueTop({
      summonerName: "",
      champion: data["participants"][0]["champion"],
      kills: Number(kills),
      deaths: Number(deaths),
      assists: Number(assists),
      damage: Number(damage),
      gold: Number(gold)
    });

    console.log(blueTop);
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
          <button type="submit">Submit</button>
        </Division>
        <Division direction="right">
          Red Side
          <fieldset player="true">
            <legend>Top</legend>
          </fieldset>
        </Division>
      </fieldset>
    </Form>
  );
}

export default AddMatch;
