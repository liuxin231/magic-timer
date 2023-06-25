import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./setting.less";
import {
  Box,
  Grid,
  Paper,
  Slider,
  Tab,
  Tabs,
  TextField,
  Typography,
  Zoom,
  styled,
  useTheme,
} from "@mui/material";
import { AccessTime, TextFormat } from "@mui/icons-material";
import { Circle } from "@uiw/react-color";
import { invoke } from '@tauri-apps/api/tauri'

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#84AF9B",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

interface TimerProps {
  hour: number;
  minute: number;
  second: number;
}
const SettingPage = () => {

  const duration = 100; // seconds
  const theme = useTheme();
  const [position, setPosition] = React.useState(50);
  const [value, setValue] = React.useState(0);
  const [hex, setHex] = React.useState("#fff");
  const [timerValue, setTimerValue] = React.useState<TimerProps>({
    hour: 0,
    minute: 40,
    second: 0,
  });
  const get_warn_timing = () => {
    invoke('get_warn_timing').then((message: any) => {
      setTimerValue({
        hour: message.hour,
        minute: message.minute,
        second: message.second,
      })
    })
  }
  const changeHour = (event: React.ChangeEvent<HTMLInputElement>) => {
    let hour: any = event.target.value.length == 0?0:event.target.value;
    setTimerValue({
      ...timerValue,
      hour: parseInt(hour),
    });
    let param: any = {
      hour: parseInt(hour),
      minute: timerValue.minute,
      second: timerValue.second,
    }
    invoke('update_timing', { timingParam: param }).then(() => get_warn_timing());
  };

  const changeMinute = (event: React.ChangeEvent<HTMLInputElement>) => {
    let minute: any = event.target.value.length == 0?0:event.target.value;
    setTimerValue({
      ...timerValue,
      minute: parseInt(minute),
    });
    let param: any = {
      hour: timerValue.hour,
      minute: parseInt(minute),
      second: timerValue.second,
    }
    invoke('update_timing', { timingParam: param }).then(() => get_warn_timing());
  };
  const changeSecond = (event: React.ChangeEvent<HTMLInputElement>) => {
    let second: any = event.target.value.length == 0?0:event.target.value;
    setTimerValue({
      ...timerValue,
      second: parseInt(second),
    });
    let param: any = {
      hour: timerValue.hour,
      minute: timerValue.minute,
      second: parseInt(second),
    }
    invoke('update_timing', { timingParam: param }).then(() => get_warn_timing());
  };
  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const transparencyChange = (value: number) => {
    setPosition(value);
    invoke('update_transparency', { value: value });
  };
  const baColorChange = (value: any) => {
    invoke('update_bg_color', {bgColor: value});
  };
  return (
    <Box
      component={"div"}
      sx={{ minHeight: "100%", width: "100%", backgroundColor: "#2C3E50" }}
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab icon={<AccessTime />} label="时间" />
          <Tab icon={<TextFormat />} label="样式" />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <Zoom in={value == 0}>
          <Box
            component={"form"}
            noValidate
            autoComplete="off"
            sx={{ flexGrow: 1 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Item>
                  <TextField
                    id="hour"
                    label="小时"
                    type="number"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    variant="standard"
                    value={timerValue.hour}
                    onChange={changeHour}
                  />
                </Item>
              </Grid>
              <Grid item xs={4}>
                <Item>
                  <TextField
                    id="minute"
                    label="分钟"
                    type="number"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    variant="standard"
                    value={timerValue.minute}
                    onChange={changeMinute}
                  />
                </Item>
              </Grid>
              <Grid item xs={4}>
                <Item>
                  <TextField
                    id="second"
                    label="秒"
                    type="number"
                    variant="standard"
                    value={timerValue.second}
                    onChange={changeSecond}
                  />
                </Item>
              </Grid>
            </Grid>
          </Box>
        </Zoom>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Zoom in={value == 1}>
          <Box
            component={"div"}
            sx={{
              minHeight: "100%",
              width: "100%",
              backgroundColor: "#2C3E50",
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography color={"#84AF9B"}>透明度</Typography>
              </Grid>
              <Grid item xs={8}>
                <Slider
                  aria-label="time-indicator"
                  size="small"
                  value={position}
                  min={0}
                  step={1}
                  max={duration}
                  onChange={(_, value) => transparencyChange(value as number)}
                  sx={{
                    color:
                      theme.palette.mode === "dark"
                        ? "#fff"
                        : "rgba(0,0,0,0.87)",
                    height: 4,
                    "& .MuiSlider-thumb": {
                      width: 8,
                      height: 8,
                      transition: "0.3s cubic-bezier(.47,1.64,.41,.8)",
                      "&:before": {
                        boxShadow: "0 2px 12px 0 rgba(0,0,0,0.4)",
                      },
                      "&:hover, &.Mui-focusVisible": {
                        boxShadow: `0px 0px 0px 8px ${
                          theme.palette.mode === "dark"
                            ? "rgb(255 255 255 / 16%)"
                            : "rgb(0 0 0 / 16%)"
                        }`,
                      },
                      "&.Mui-active": {
                        width: 20,
                        height: 20,
                      },
                    },
                    "& .MuiSlider-rail": {
                      opacity: 0.28,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={4}>
                <Typography color={"#84AF9B"}>面板颜色</Typography>
              </Grid>
              <Grid item xs={8}>
                <Circle
                  colors={[
                    "#f44336",
                    "#e91e63",
                    "#9c27b0",
                    "#673ab7",
                    "#3f51b5",
                    "#2196f3",
                    "#03a9f4",
                    "#00bcd4",
                    "#009688",
                    "#4caf50",
                    "#8bc34a",
                    "#cddc39",
                    "#ffeb3b",
                    "#ffc107",
                    "#ff9800",
                    "#ff5722",
                    "#795548",
                    "#607d8b",
                    "#FFFFFF",
                    "#000000",
                  ]}
                  color={hex}
                  onChange={(color) => {
                    baColorChange(color.rgba);
                    setHex(color.hex);
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </Zoom>
      </TabPanel>
    </Box>
  );
};
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <SettingPage />
  </React.StrictMode>
);
