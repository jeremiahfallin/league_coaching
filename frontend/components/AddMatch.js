import React, { useState, useEffect } from "react";
import Form from "./styles/Form";
import Router from "next/router";
import Error from "./ErrorMessage";
import styled from "styled-components";
import PlayerInfo from "./PlayerInfo";
import debounce from "lodash.debounce";
import gql from "graphql-tag";

const CREATE_MATCH_MUTATION = gql`
  mutation CREATE_MATCH_MUTATION(
    $players: [Players!]!
    $stats: [Stats!]!
    $teams: [Team!]!
    $duration: Int!
    $winner: Team!
  ) {
    createMatch(
      players: $players
      stats: $stats
      teams: $teams
      duration: $duration
      winner: $winner
    )
  }
`;

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
  let baseStats = {
    summonerName: "",
    champion: "",
    kills: 0,
    deaths: 0,
    assists: 0,
    damage: 0,
    gold: 0
  };

  let teamPlayerInfo = {
    top: { ...baseStats },
    jungle: { ...baseStats },
    mid: { ...baseStats },
    carry: { ...baseStats },
    support: { ...baseStats }
  };

  const [loading, setLoading] = useState(false);
  const [matchID, setMatchID] = useState(0);
  const [blueTeam, setBlueTeam] = useState({ ...teamPlayerInfo });
  const [redTeam, setRedTeam] = useState({ ...teamPlayerInfo });

  const callBackendAPI = async match => {
    const response = await fetch(
      `http://localhost:4444/addmatch?match=${match}`
    );
    if (response.status !== 200) {
      setLoading(false);
      throw Error(body.message);
    }

    const body = await response.json();
    if (body["message"]) {
      delete baseStats.summonerName;
      setBlueTeam(teamPlayerInfo);
      setRedTeam(teamPlayerInfo);
      setLoading(false);
    }
    const data = body["data"];
    console.log(data);

    // 3102504145
    if (data) {
      const setLane = i => {
        const {
          kills,
          deaths,
          assists,
          totalDamageDealtToChampions: damage,
          goldEarned: gold
        } = data["participants"][i]["stats"];
        return {
          champion: data["participants"][i]["champion"],
          kills: Number(kills),
          deaths: Number(deaths),
          assists: Number(assists),
          damage: Number(damage),
          gold: Number(gold)
        };
      };

      for (let i = 0; i < 5; i++) {
        setBlueTeam(setLane(i));
      }
      for (let i = 5; i < 10; i++) {
        setRedTeam(setLane(i));
      }
      setLoading(false);
    }
  };

  const getMatch = debounce(async e => {
    setMatchID(e.target.value);
  }, 350);

  useEffect(() => {
    callBackendAPI(matchID);
  }, [matchID]);

  return (
    <Form
      onSubmit={async e => {
        e.preventDefault();
        Router.push({
          pathname: "/addmatch"
        });
      }}
    >
      <Column>
        <label htmlFor="matchID">
          <input
            type="number"
            id="matchID"
            name="matchID"
            placeholder="Match ID"
            required
            onChange={e => {
              e.persist();
              setLoading(true);
              getMatch(e);
            }}
          />
        </label>
      </Column>

      <fieldset disabled={loading} aria-busy={loading}>
        <Division direction="left">
          Blue Side
          <label htmlFor="blueTeam">
            <input
              type="number"
              id="blueTeam"
              name="blueTeam"
              placeholder="Blue Team"
              required
              onChange={e => {
                e.persist();
              }}
            />
          </label>
          <fieldset player="true">
            <legend>Top</legend>
            <PlayerInfo
              playerData={blueTeam}
              setPlayerData={setBlueTeam}
              position={"top"}
            />
          </fieldset>
          <fieldset player="true">
            <legend>Jungle</legend>
            <PlayerInfo
              playerData={blueTeam}
              setPlayerData={setBlueTeam}
              position={"jungle"}
            />
          </fieldset>
          <fieldset player="true">
            <legend>Mid</legend>
            <PlayerInfo
              playerData={blueTeam}
              setPlayerData={setBlueTeam}
              position={"mid"}
            />
          </fieldset>
          <fieldset player="true">
            <legend>Carry</legend>
            <PlayerInfo
              playerData={blueTeam}
              setPlayerData={setBlueTeam}
              position={"support"}
            />
          </fieldset>
          <fieldset player="true">
            <legend>Support</legend>
            <PlayerInfo
              playerData={blueTeam}
              setPlayerData={setBlueTeam}
              position={"support"}
            />
          </fieldset>
          <button type="submit">Submit</button>
        </Division>
        <Division direction="right">
          Red Side
          <label htmlFor="redTeam">
            <input
              type="number"
              id="redTeam"
              name="redTeam"
              placeholder="Red Team"
              required
              onChange={e => {
                e.persist();
              }}
            />
          </label>
          <fieldset player="true">
            <legend>Top</legend>
            <PlayerInfo
              playerData={redTeam}
              setPlayerData={setRedTeam}
              position={"top"}
            />
          </fieldset>
          <fieldset player="true">
            <legend>Jungle</legend>
            <PlayerInfo
              playerData={redTeam}
              setPlayerData={setRedTeam}
              position={"jungle"}
            />
          </fieldset>
          <fieldset player="true">
            <legend>Mid</legend>
            <PlayerInfo
              playerData={redTeam}
              setPlayerData={setRedTeam}
              position={"mid"}
            />
          </fieldset>
          <fieldset player="true">
            <legend>Carry</legend>
            <PlayerInfo
              playerData={redTeam}
              setPlayerData={setRedTeam}
              position={"carry"}
            />
          </fieldset>
          <fieldset player="true">
            <legend>Support</legend>
            <PlayerInfo
              playerData={redTeam}
              setPlayerData={setRedTeam}
              position={"support"}
            />
          </fieldset>
        </Division>
      </fieldset>
    </Form>
  );
}

export default AddMatch;
