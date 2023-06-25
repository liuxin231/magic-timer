import { useEffect } from "react";
import "./App.less";
import {
  AppBar,
  BottomNavigation,
  BottomNavigationAction,
  Container,
  Slide,
  styled,
} from "@mui/material";
import React from "react";
import { WebviewWindow } from "@tauri-apps/api/window";
import { Settings, Timer } from "@mui/icons-material";
import { invoke } from "@tauri-apps/api/tauri";
const StyledTimer = styled(Timer)`
  ${({ color }) => {
    if (color == "error") {
      return `
      cursor: pointer;
      animation: animate 2s linear infinite;
      `;
    } else {
      return `
      cursor: pointer;
      `;
    }
  }}
`;
const webview = new WebviewWindow("main");
function App() {
  const [nowDateTime, setNowDateTime] = React.useState("");

  const [timing, setTiming] = React.useState("");
  const [value, _] = React.useState("favorites");
  const [appBarShow, setAppBarShow] = React.useState(false);
  const [panelBgRgba, setPanelGbRgba] = React.useState({ backgroundColor: "rgba(255, 255, 255, .2)", color: "#FFF" });

  let mouseEnter = () => {
    webview.setDecorations(true);
    setAppBarShow(true);
  };
  let mouseLevel = () => {
    webview.setDecorations(false);
    setAppBarShow(false);
  };
  // | 'action'
  // | 'primary'
  // | 'error'
  const [color, setColor] = React.useState<any>("action");

  const timerClick = () => {
    invoke("timer_btn_click");
  };
  const timerDoubleClick = () => {
    invoke("timer_btn_double_click");
  };
  const showSettingWindow = () => {
    new WebviewWindow("setting", {
      title: 'magic-timer setting',
      url: '/src/pages/setting/index.html',
      width: 500,
      height: 300,
    });
    webview.setDecorations(false);
    setAppBarShow(false);
  };
  const timingText = <div style={{ fontSize: "25px" }}>{timing}</div>;

  const nowDateTimeText = <div style={{ fontSize: "15px" }}>{nowDateTime}</div>;
  useEffect(() => {
    webview.listen("now_date_time", (event) => {
      let now_date_time = event.payload as string;
      setNowDateTime(now_date_time);
    });
    webview.listen("timing", (event) => {
      let timing = event.payload as string;
      setTiming(timing);
    });

    webview.listen("btn_color", (event) => {
      let color = event.payload as string;
      setColor(color);
    });
    webview.listen("update_bgColor", (event) => {
      setPanelGbRgba({ backgroundColor: event.payload as string, color: "#FFF" });
      
    });
  });
  return (
    <div
      onMouseEnter={mouseEnter}
      onMouseLeave={mouseLevel}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(255, 255, 255, 0)",
      }}
    >
      <Slide direction="down" in={appBarShow} mountOnEnter unmountOnExit>
        <AppBar
          sx={{ height: "15px", backgroundColor: "rgba(255, 255, 255, .5)" }}
        >
          <Container maxWidth="xl" sx={{ textAlign: "right" }}>
            <Settings
              color="primary"
              fontSize="small"
              onClick={showSettingWindow}
              style={{ fontSize: "15px", cursor: "pointer" }}
            />
          </Container>
        </AppBar>
      </Slide>
      <BottomNavigation
        showLabels
        value={value}
        sx={panelBgRgba}
      >
        <BottomNavigationAction
          disabled
          label={nowDateTimeText}
          sx={{ fontWeight: "500", fontSize: "50px" }}
          value="recents"
        />
        <BottomNavigationAction
          disabled
          sx={{ fontWeight: "500" }}
          label={timingText}
          value="nearby"
        />
        <BottomNavigationAction
          onClick={timerClick}
          onDoubleClick={timerDoubleClick}
          value="favorites"
          icon={<StyledTimer color={color} fontSize="medium" />}
        />
      </BottomNavigation>
    </div>
  );
}

export default App;
