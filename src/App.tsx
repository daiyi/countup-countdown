import { useDocument, useRepo } from "automerge-repo-react-hooks";
import { DocumentId } from "automerge-repo";
import { Button, Text, Container, MantineProvider, Title } from "@mantine/core";
import { Calendar, DatePicker } from "@mantine/dates";
import { useState } from "react";

import { State } from "./types";
import dayjs from "dayjs";

export default function App(props: { rootId: DocumentId }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showSettings, setShowSettings] = useState(false);

  const repo = useRepo();

  const { rootId: documentId } = props;

  const [state, changeState] = useDocument<State>(documentId);

  if (!state) {
    return <DeleteStorageButton />;
  }

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <Container size="xs" px="xs">
        <Calendar
          size="xl"
          fullWidth
          value={selectedDate}
          onChange={setSelectedDate}
          renderDay={(date) => {
            const day = date.getDate();
            const daysSinceStart = state.countUpDate
              ? dayjs(date).diff(state.countUpDate, "day")
              : -1;
            return (
              <div>
                {state.countDownDate &&
                  dayjs(date).isSame(state.countDownDate, "date") && (
                    <div
                      style={{
                        position: "absolute",
                        lineHeight: "1em",
                        fontSize: ".6em",
                        top: 0,
                        right: 0,
                      }}
                    >
                      !!!
                    </div>
                  )}
                {daysSinceStart >= 0 && daysSinceStart % 7 === 0 && (
                  <div
                    style={{
                      position: "absolute",
                      lineHeight: "1em",
                      fontSize: ".6em",
                      top: 0,
                      left: 0,
                    }}
                  >
                    wk {daysSinceStart / 7 + 1}
                  </div>
                )}
                <div
                  style={
                    dayjs(date).isSame(new Date(), "date")
                      ? {
                          fontWeight: "bold",
                        }
                      : undefined
                  }
                >
                  {day}
                </div>
              </div>
            );
          }}
        />

        <br />
        {state.countUpDate &&
          dayjs(selectedDate).diff(state.countUpDate, "day") >= 0 && (
            <div>
              It's day {dayjs(selectedDate).diff(state.countUpDate, "day")}{" "}
              <Text c="dimmed" component="span">
                ({dayjs(selectedDate).diff(state.countUpDate, "week") + 1} weeks{" "}
                {dayjs(selectedDate).diff(state.countUpDate, "days") % 7} days)
              </Text>
            </div>
          )}
        {state.countDownDate &&
          dayjs(state.countDownDate).diff(selectedDate, "day", true) >= 0 && (
            <div>
              Days until {dayjs(state.countDownDate).format("DD MMM YYYY")}:{" "}
              {dayjs(state.countDownDate).diff(selectedDate, "day") + 1} (
              {(
                (dayjs(state.countDownDate).diff(selectedDate, "day") + 1) /
                7.0
              ).toFixed(1)}{" "}
              weeks)
            </div>
          )}
        {state.countDownDate &&
          dayjs(selectedDate).isSame(state.countDownDate, "date") && (
            <div>THAT'S TODAY</div>
          )}
        <br />
        <Button
          variant="subtle"
          color="gray"
          onClick={() => setSelectedDate(new Date())}
        >
          Go to today
        </Button>
        <Button
          variant={showSettings ? "filled" : "subtle"}
          color={showSettings ? "blue" : "gray"}
          onClick={() => setShowSettings((s) => !s)}
        >
          Settings
        </Button>
        <Button variant="subtle" color="gray" disabled>
          Share
        </Button>
      </Container>
      {showSettings && (
        <Container size="xs" px="xs">
          <br />
          <Title order={3}>Count Down</Title>
          <DatePicker
            renderDay={(date) => (
              <div
                style={
                  dayjs(date).isSame(new Date(), "date")
                    ? {
                        fontWeight: "bold",
                      }
                    : undefined
                }
              >
                {date.getDate()}
              </div>
            )}
            defaultValue={state.countDownDate}
            label="Date to count down to"
            placeholder="Select date"
            value={state.countDownDate}
            onChange={(x) => {
              changeState((s) => {
                s.countDownDate = x;
              });
            }}
          />
          <br />
          <Title order={3}>Count Up</Title>
          <DatePicker
            renderDay={(date) => (
              <div
                style={
                  dayjs(date).isSame(new Date(), "date")
                    ? {
                        fontWeight: "bold",
                      }
                    : undefined
                }
              >
                {date.getDate()}
              </div>
            )}
            defaultValue={state.countUpDate}
            label="Date to count up from"
            placeholder="Select date"
            value={state.countUpDate}
            onChange={(x) => {
              changeState((s) => {
                s.countUpDate = x;
              });
            }}
          />
          <br />
          <br />
          <div>If you have a problem:</div>
          <DeleteStorageButton />
        </Container>
      )}
    </MantineProvider>
  );
}

const DeleteStorageButton = () => (
  <Button
    variant="outline"
    color="red"
    onClick={() => {
      localStorage.removeItem("rootDocId");
      location.reload();
    }}
  >
    reset localStorage
  </Button>
);
