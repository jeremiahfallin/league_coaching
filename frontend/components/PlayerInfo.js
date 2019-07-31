import React, { useState, useEffect } from "react";
import styled from "styled-components";

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

function PlayerInfo({ playerData, setPlayerData }) {
  const widthKDA = 10;

  const handleplayerDataChange = e => {
    console.log(playerData);
    const { name, value } = e.target;

    setPlayerData({ ...playerData, [name]: value });
  };

  return (
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
            onChange={e => handleplayerDataChange(e)}
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
            value={playerData.champion}
            onChange={e => handleplayerDataChange(e)}
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
              value={playerData.kills}
              onChange={e => handleplayerDataChange(e)}
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
              value={playerData.deaths}
              onChange={e => handleplayerDataChange(e)}
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
              value={playerData.assists}
              onChange={e => handleplayerDataChange(e)}
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
              value={playerData.damage}
              onChange={e => handleplayerDataChange(e)}
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
              value={playerData.gold}
              onChange={e => handleplayerDataChange(e)}
            />
          </label>
        </Box>
      </Row>
    </Column>
  );
}

export default PlayerInfo;
