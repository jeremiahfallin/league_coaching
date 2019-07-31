import React, { useState, useEffect } from "react";
import Form from "./styles/Form";
import Router from "next/router";
import Error from "./ErrorMessage";
import styled from "styled-components";

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

  const widthKDA = 10;

  const callBackendAPI = async match => {
    const response = await fetch(
      `http://localhost:4444/addmatch?match=${match}`
    );
    const body = await response.json();
    const data = body["data"];
    const participants = data["participants"];
    console.log(data);
    // 3102504145

    setBlueTop({
      summonerName: "",
      champion: participants[0]["champion"],
      kills: Number(participants[0]["stats"]["kills"]),
      deaths: Number(participants[0]["stats"]["deaths"]),
      assists: Number(participants[0]["stats"]["assists"]),
      damage: Number(participants[0]["stats"]["totalDamageDealtToChampions"]),
      gold: Number(participants[0]["stats"]["goldEarned"])
    });

    console.log(blueTop);

    if (response.status !== 200) {
      throw Error(body.message);
    }
  };

  const handleBlueTopChange = e => {
    const { name, value } = e.target;
    let top = blueTop;
    top[name] = value;
    setBlueTop({ top });
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
            <Column>
              <Box>
                <label htmlFor="summonerName">
                  Summoner Name
                  <input
                    type="text"
                    id="summonerName"
                    name="summonerName"
                    placeholder="Summoner Name"
                    required
                    onChange={e => handleBlueTopChange(e)}
                  />
                </label>
              </Box>
              <Box>
                <label htmlFor="champion">
                  Champion
                  <input
                    type="text"
                    id="champion"
                    name="champion"
                    placeholder="Champion"
                    required
                    value={blueTop.champion}
                    onChange={e => handleBlueTopChange(e)}
                  />
                </label>
              </Box>

              <Row>
                <Box>
                  <label htmlFor="kills">
                    K
                    <input
                      type="number"
                      id="kills"
                      name="kills"
                      placeholder="Kills"
                      size={widthKDA}
                      required
                      value={blueTop.kills}
                      onChange={e => handleBlueTopChange(e)}
                    />
                  </label>
                </Box>
                <Box>
                  <label htmlFor="deaths">
                    D
                    <input
                      type="number"
                      id="deaths"
                      name="deaths"
                      placeholder="Deaths"
                      size={widthKDA}
                      required
                      value={blueTop.deaths}
                      onChange={e => handleBlueTopChange(e)}
                    />
                  </label>
                </Box>
                <Box>
                  <label htmlFor="assists">
                    A
                    <input
                      type="number"
                      id="assists"
                      name="assists"
                      placeholder="Assists"
                      size={widthKDA}
                      required
                      value={blueTop.assists}
                      onChange={e => handleBlueTopChange(e)}
                    />
                  </label>
                </Box>
              </Row>
              <Row>
                <Box>
                  <label htmlFor="damage">
                    Damage
                    <input
                      type="number"
                      id="damage"
                      name="damage"
                      placeholder="Damage"
                      required
                      value={blueTop.damage}
                      onChange={e => handleBlueTopChange(e)}
                    />
                  </label>
                </Box>
                <Box>
                  <label htmlFor="gold">
                    Gold
                    <input
                      type="number"
                      id="gold"
                      name="gold"
                      placeholder="Gold"
                      required
                      value={blueTop.gold}
                      onChange={e => handleBlueTopChange(e)}
                    />
                  </label>
                </Box>
              </Row>
            </Column>
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
