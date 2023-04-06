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
  Box,
  TextInput,
  Paper,
  Textarea,
  Stack,
  useMantineTheme,
  Checkbox,
} from "@mantine/core";
import { Calendar, DatePicker } from "@mantine/dates";
import { useMediaQuery } from "@mantine/hooks";
import { useState } from "react";

import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

import { Params, State } from "./types";
import { createParams, getShareUrl } from "./util";

export default function App(props: { rootId: DocumentId; params?: Params }) {
  const theme = useMantineTheme();
  const isSmallView = useMediaQuery("(max-width: 570px)");
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [month, setMonth] = useState(selectedDate || undefined);
  const [showSettings, setShowSettings] = useState(false);
  const [redeemError, setRedeemError] = useState("");

  const repo = useRepo();

  const { rootId: documentId } = props;

  const [state, changeState] = useDocument<State>(documentId);

  if (!state) {
    return (
      <Group>
        <ClearUrlButton />
        <DeleteStorageButton />
      </Group>
    );
  }

  // rip. If there's params, show incoming params. If not, show what's saved in state
  const countUpDate = props.params
    ? props.params.s
    : state?.countUpDate || null;
  const countDownDate = props.params
    ? props.params.e
    : state?.countDownDate || null;
  const title = props.params ? props.params.t : state?.title || "";
  const displaySettings = props.params
    ? props.params.d
    : state?.displaySettings || { calendar: true };

  const countUpDays = dayjs(selectedDate).diff(countUpDate, "day");
  const countUpWeeks = dayjs(selectedDate).diff(countUpDate, "week");
  const countDownDays = dayjs(countDownDate).diff(selectedDate, "day");

  const hasNoDates = !countUpDate && !countDownDate;
  const actuallyShowSettings = hasNoDates || showSettings;

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
        components: {
          Calendar: {
            styles: {
              cell: {
                border: 0,
              },
              day: {
                borderRadius: 0,
              },
            },
          },
        },
      }}
    >
      {!!countUpDays && !!countDownDays && (
        <Progress
          radius={0}
          value={(countUpDays / (countUpDays + countDownDays)) * 100}
          color="orange"
          sx={(theme) => ({
            backgroundImage: theme.fn.gradient({
              from: theme.colors.teal[4],
              to: theme.colors.blue[6],
              deg: 0,
            }),
          })}
        />
      )}
      {!countUpDays && !!countDownDays && (
        <Progress
          radius={0}
          value={(0 / countDownDays) * 100}
          color="orange"
          sx={(theme) => ({
            backgroundImage: theme.fn.gradient({
              from: theme.colors.blue[4],
              to: theme.colors.blue[6],
              deg: 45,
            }),
          })}
        />
      )}
      {!!countUpDays && !countDownDays && (
        <Progress
          radius={0}
          value={(0 / countDownDays) * 100}
          color="orange"
          sx={(theme) => ({
            backgroundImage: theme.fn.gradient({
              from: theme.colors.orange[4],
              to: theme.colors.orange[6],
              deg: 45,
            }),
          })}
        />
      )}
      <Flex gap="xl" align="center" direction="column" wrap="wrap">
        {countUpDate && (
          <Container size="xs" w="100%">
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
                    {dayjs().isSame(selectedDate, "date") ? "It's" : "That's"}{" "}
                    day
                  </Text>
                  <Text fz="36px" fw="bold" color="orange.9">
                    {countUpDays}
                  </Text>
                  <Text fz="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                    ({countUpWeeks} weeks {countUpDays % 7} days)
                  </Text>
                </div>
              )}
              {countDownDate &&
                dayjs(countDownDate).diff(selectedDate, "day", true) >= 0 && (
                  <div>
                    <Text>
                      {dayjs().isSame(selectedDate, "date")
                        ? "Days to go"
                        : "Days from there"}
                    </Text>

                    <Text fz="36px" fw="bold" color="blue.9">
                      {countDownDays}
                    </Text>

                    {countDownDate &&
                    dayjs(selectedDate).isSame(countDownDate, "date") ? (
                      <Text fz="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                        THAT'S TODAY
                      </Text>
                    ) : (
                      <Text fz="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                        ({(countDownDays / 7.0).toFixed(1)} weeks)
                      </Text>
                    )}
                  </div>
                )}
            </Flex>
          </Container>
        )}
        <Container size="xs" px="xs">
          {props.params && (
            <Flex direction="column" mb="xl">
              <Paper p="lg" bg="gray.0">
                <Text c="dimmed">
                  You're checking out{" "}
                  {title ? <em>{title}</em> : "someone else's countdown"}
                </Text>
                <Group position="right" mt="md">
                  <ClearUrlButton label="Back to yours" />
                  <Button
                    variant="subtle"
                    color="gray"
                    onClick={() => {
                      changeState((s) => {
                        s.countDownDate = countDownDate || null;
                        s.countUpDate = countUpDate || null;
                        s.title = title;
                        s.displaySettings = displaySettings || {};
                      });
                      setTimeout(() => {
                        window.location.href =
                          window.location.origin + window.location.pathname;
                      }, 800);
                    }}
                  >
                    Save this one
                  </Button>
                </Group>
              </Paper>
            </Flex>
          )}
          {!hasNoDates && displaySettings?.calendar && (
            <Paper withBorder p="lg" radius="md">
              <Calendar
                weekendDays={[]}
                size="xl"
                fullWidth
                value={selectedDate}
                onChange={setSelectedDate}
                month={month}
                onMonthChange={setMonth}
                dayStyle={(date, modifiers) => {
                  if (!modifiers.selected) {
                    return {
                      backgroundColor:
                        dayjs(date).isSameOrAfter(countUpDate) &&
                        dayjs(date).isSameOrBefore(new Date())
                          ? theme.colors.orange[0]
                          : dayjs(date).isAfter(new Date()) &&
                            dayjs(date).isSameOrBefore(countDownDate)
                          ? theme.colors.blue[0]
                          : "transparent",
                    };
                  }
                  return {};
                }}
                renderDay={(date) => {
                  const day = date.getDate();
                  const daysSinceStart = countUpDate
                    ? dayjs(date).diff(countUpDate, "day")
                    : -1;
                  return (
                    <Box>
                      {countDownDate &&
                        dayjs(date).isSame(countDownDate, "date") && (
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
                      {dayjs(date).isSameOrAfter(countUpDate) &&
                        dayjs(date).isSameOrBefore(countDownDate) &&
                        daysSinceStart >= 0 &&
                        daysSinceStart % 7 === 0 && (
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
                      <Box
                        sx={(theme) => ({
                          borderTop: `2px solid ${
                            dayjs(date).isSameOrAfter(countUpDate) &&
                            dayjs(date).isSameOrBefore(new Date())
                              ? theme.colors.orange[4]
                              : dayjs(date).isAfter(new Date()) &&
                                dayjs(date).isSameOrBefore(countDownDate)
                              ? theme.colors.blue[4]
                              : "transparent"
                          }`,
                          fontWeight: dayjs(date).isSame(new Date(), "date")
                            ? "bold"
                            : "unset",
                          color:
                            countUpDate && dayjs(date).isBefore(countUpDate)
                              ? "lightgray"
                              : "unset",
                        })}
                      >
                        {day}
                      </Box>
                    </Box>
                  );
                }}
              />
            </Paper>
          )}
          <br />
          <Button
            variant="subtle"
            color="gray"
            onClick={() => {
              setSelectedDate(new Date());
              setMonth(new Date());
            }}
          >
            Go to today
          </Button>
          <Button
            variant={actuallyShowSettings ? "filled" : "subtle"}
            color={actuallyShowSettings ? "blue" : "gray"}
            onClick={() => setShowSettings((s) => !s)}
            disabled={!!props.params}
          >
            Settings
          </Button>
          <CopyButton
            value={getShareUrl({
              s: countUpDate,
              e: countDownDate,
              t: title,
              d: displaySettings,
            })}
          >
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
        {actuallyShowSettings && (
          <Container size="xs" px="xs" mt="xl" w="100%">
            <Stack spacing="xs" mb="xl">
              <Title order={3}>Count Up</Title>
              <DatePicker
                dropdownType={isSmallView ? "modal" : "popover"}
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
                    if (hasNoDates) {
                      // if just set your first date, keep the settings open
                      setShowSettings(true);
                    }
                  });
                }}
              />
            </Stack>
            <Stack spacing="xs" mb="xl">
              <Title order={3}>Count Down</Title>
              <DatePicker
                dropdownType={isSmallView ? "modal" : "popover"}
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
                defaultValue={countDownDate}
                label="Date to count down to"
                placeholder="Select date"
                value={countDownDate}
                onChange={(x) => {
                  changeState((s) => {
                    s.countDownDate = x;
                    if (hasNoDates) {
                      // if just set your first date, keep the settings open
                      setShowSettings(true);
                    }
                  });
                }}
              />
            </Stack>
            <Stack spacing="xs" mb="xl">
              <Title order={3}>About</Title>
              <TextInput
                label="Title"
                placeholder="my bday"
                value={title}
                disabled={!!props.params}
                onChange={(e) => {
                  changeState((s) => {
                    s.title = e.target.value;
                  });
                }}
              />
            </Stack>
            <Stack spacing="xs" mb="xl">
              <Title order={3}>Display</Title>
              <Checkbox
                label="Show calendar"
                checked={displaySettings?.calendar || false}
                onChange={(e) => {
                  changeState((s) => {
                    if (!s.displaySettings) {
                      s.displaySettings = {};
                    }
                    s.displaySettings.calendar = e.target.checked;
                  });
                }}
              />
            </Stack>
            <Stack spacing="xs" mb="xl">
              <Title order={3}>Extras</Title>
              <Textarea
                label="view share url"
                placeholder="https://daiyi.co/countup-countdown/?s=2023-03-06"
                error={redeemError}
                onBlur={(e) => {
                  if (!e.target.value) {
                    setRedeemError("");
                  }
                }}
                onChange={(e) => {
                  const maybeUrl = e.target.value;
                  try {
                    const params = createParams(maybeUrl);
                    if (params && Object.values(params).length > 0) {
                      window.location.href = getShareUrl(params);
                    } else {
                      setRedeemError("not a valid url");
                    }
                  } catch (e: unknown) {
                    const error = e as TypeError;
                    setRedeemError(error.message);
                  }
                }}
              />
            </Stack>
            <Box>If you have a problem:</Box>
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
const ClearUrlButton = ({ label = "" }: { label?: string }) => (
  <Button
    variant="subtle"
    color="gray"
    onClick={() =>
      (window.location.href = window.location.origin + window.location.pathname)
    }
  >
    {label ? label : "Clear url"}
  </Button>
);
