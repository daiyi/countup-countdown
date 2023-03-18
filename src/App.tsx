import { useDocument, useRepo } from "automerge-repo-react-hooks";
import { DocumentId } from "automerge-repo";
import {
  Button,
  Text,
  Container,
  MantineProvider,
  Title,
  Flex,
  Group,
  Progress,
  CopyButton,
} from "@mantine/core";
import { Calendar, DatePicker } from "@mantine/dates";
import { useState } from "react";

import { Params, State, urlDateFormat } from "./types";
import dayjs from "dayjs";

export default function App(props: { rootId: DocumentId; params?: Params }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showSettings, setShowSettings] = useState(false);

  const repo = useRepo();

  const { rootId: documentId } = props;

  const [state, changeState] = useDocument<State>(documentId);

  if (!state) {
    return <DeleteStorageButton />;
  }

  const countUpDate =
    props.params && props.params.s ? props.params.s : state.countUpDate;
  const countDownDate =
    props.params && props.params.e ? props.params.e : state.countDownDate;

  const countUpDays = dayjs(selectedDate).diff(countUpDate, "day");
  const countUpWeeks = dayjs(selectedDate).diff(countUpDate, "week");
  const countDownDays = dayjs(countDownDate).diff(selectedDate, "day");

  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        colors: {
          brand: [
            "#F4FCE3",
            "#E9FAC8",
            "#D8F5A2",
            "#C0EB75",
            "#A9E34B",
            "#94D82D",
            "#9ddb44", // primary shade, app theme color
            "#74B816",
            "#66A80F",
            "#5C940D",
          ],
        },
        primaryColor: "brand",
      }}
    >
      {!!countUpDays && !!countDownDays && (
        <Progress
          radius={0}
          value={(countUpDays / (countUpDays + countDownDays)) * 100}
          color="orange"
          sx={(theme) => ({
            backgroundImage: theme.fn.gradient({
              from: "teal",
              to: "blue",
              deg: 45,
            }),
          })}
        />
      )}
      <Flex gap="xl" align="center" direction="column" wrap="wrap">
        {(countUpDate || state.countDownDate) && (
          <Flex
            gap="lg"
            justify="space-around"
            direction="row"
            wrap="nowrap"
            // bg="brand"
            w="100%"
          >
            {countUpDate && countUpDays >= 0 && (
              <div>
                <Text>
                  {dayjs().isSame(selectedDate, "date") ? "It's" : "That's"} day
                </Text>
                <Text fz="36px" fw="bold" color="orange.9">
                  {countUpDays}
                </Text>
                <Text fz="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                  ({countUpWeeks + 1} weeks {countUpDays % 7} days)
                </Text>
              </div>
            )}
            {state.countDownDate &&
              dayjs(state.countDownDate).diff(selectedDate, "day", true) >=
                0 && (
                <div>
                  <Text>
                    {dayjs().isSame(selectedDate, "date")
                      ? "Days to go"
                      : "Days from there"}
                  </Text>
                  <Text fz="36px" fw="bold" color="blue.9">
                    {countDownDays + 1}
                  </Text>
                  <Text fz="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                    ({((countDownDays + 1) / 7.0).toFixed(1)} weeks)
                  </Text>
                </div>
              )}
            {state.countDownDate &&
              dayjs(selectedDate).isSame(state.countDownDate, "date") && (
                <div>THAT'S TODAY</div>
              )}
          </Flex>
        )}

        <Container size="xs" px="xs">
          {props.params && (
            <Flex direction="column" mb="xl" ml="lg">
              <Text color="dimmed">
                You're checking out someone else's countup/countdown
              </Text>
              <Group>
                <Button
                  variant="subtle"
                  color="gray"
                  onClick={() =>
                    (window.location.href =
                      window.location.origin + window.location.pathname)
                  }
                >
                  Clear
                </Button>
                <Button
                  variant="subtle"
                  color="gray"
                  onClick={() => {
                    changeState((s) => {
                      s.countDownDate = countDownDate;
                      s.countUpDate = countUpDate;
                    });
                  }}
                >
                  Make this yours
                </Button>
              </Group>
            </Flex>
          )}
          <Calendar
            size="xl"
            fullWidth
            value={selectedDate}
            onChange={setSelectedDate}
            renderDay={(date) => {
              const day = date.getDate();
              const daysSinceStart = countUpDate
                ? dayjs(date).diff(countUpDate, "day")
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
            disabled={!!props.params}
          >
            Settings
          </Button>
          <CopyButton value={getShareUrl({ s: countUpDate, e: countDownDate })}>
            {({ copied, copy }) => (
              <Button
                variant="subtle"
                color={copied ? "teal" : "gray"}
                onClick={copy}
              >
                {copied ? "Copied url" : "Share"}
              </Button>
            )}
          </CopyButton>
        </Container>
        {showSettings && (
          <Container size="xs" px="xs">
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
              defaultValue={countUpDate}
              label="Date to count up from"
              placeholder="Select date"
              value={countUpDate}
              onChange={(x) => {
                changeState((s) => {
                  s.countUpDate = x;
                });
              }}
            />
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
            <br />
            <div>If you have a problem:</div>
            <DeleteStorageButton />
          </Container>
        )}
      </Flex>
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

function getShareUrl(params: Params): string {
  const urlParams = new URLSearchParams();
  if (params.s) {
    urlParams.set("s", dayjs(params.s).format(urlDateFormat));
  }
  if (params.e) {
    urlParams.set("e", dayjs(params.e).format(urlDateFormat));
  }
  return (
    window.location.origin +
    window.location.pathname +
    "?" +
    urlParams.toString()
  );
}
