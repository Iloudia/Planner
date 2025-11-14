import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useRef } from "react";
import type { ScheduledTask } from "../../data/sampleData";
import { plannerCardRouteById, plannerCardRoutes } from "../../data/plannerCardRoutes";
import { useTasks } from "../../context/TasksContext";
import { useAuth } from "../../context/AuthContext";
import usePersistentState from "../../hooks/usePersistentState";
import planner01 from "../../assets/planner-01.jpg";
import planner02 from "../../assets/planner-02.jpg";
import planner03 from "../../assets/planner-03.jpg";
import planner04 from "../../assets/planner-04.jpg";
import planner05 from "../../assets/planner-05.jpg";
import planner06 from "../../assets/planner-06.jpg";
import planner07 from "../../assets/planner-07.jpg";
import planner08 from "../../assets/planner-08.jpg";
import planner09 from "../../assets/planner-09.jpg";
import planner10 from "../../assets/planner-10.jpg";
import visionBoardMood from "../../assets/MoodBoard.png";
import "./PlannerPage.css";

type DashboardCard = {
  id: string;
  title: string;
  image: string;
  path?: string;
};

type UpcomingTask = ScheduledTask & { startDate: Date };

type UpcomingGroup = {
  key: string;
  accent: string;
  dateLabel: string;
  dayNumber: string;
  weekday: string;
  tasks: Array<{ id: string; title: string; timeRange: string; tag: string }>;
};

type ProgressCard = {
  key: string;
  label: string;
  percent: number;
  meta: string;
  accent: string;
};

const ZODIAC_SIGNS: ZodiacSign[] = [
  { value: "Bélier", label: "Bélier · 21 mars – 19 avril", emoji: "♈" },
  { value: "Taureau", label: "Taureau · 20 avril – 20 mai", emoji: "♉" },
  { value: "Gémeaux", label: "Gémeaux · 21 mai – 20 juin", emoji: "♊" },
  { value: "Cancer", label: "Cancer · 21 juin – 22 juillet", emoji: "♋" },
  { value: "Lion", label: "Lion · 23 juillet – 22 août", emoji: "♌" },
  { value: "Vierge", label: "Vierge · 23 août – 22 septembre", emoji: "♍" },
  { value: "Balance", label: "Balance · 23 septembre – 22 octobre", emoji: "♎" },
  { value: "Scorpion", label: "Scorpion · 23 octobre – 21 novembre", emoji: "♏" },
  { value: "Sagittaire", label: "Sagittaire · 22 novembre – 21 décembre", emoji: "♐" },
  { value: "Capricorne", label: "Capricorne · 22 décembre – 19 janvier", emoji: "♑" },
  { value: "Verseau", label: "Verseau · 20 janvier – 18 février", emoji: "♒" },
  { value: "Poissons", label: "Poissons · 19 février – 20 mars", emoji: "♓" },
];

const DEFAULT_ZODIAC_SIGN = ZODIAC_SIGNS[0]?.value ?? "Bélier";
const PROFILE_STORAGE_KEY = "planner.profile";
const DEFAULT_PROFILE_NAME = "Profil Planner";
const DEFAULT_JOINED_DATE = "2025-11-13T00:00:00.000Z";
const joinedDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const birthdayFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const formatNameFromEmail = (email: string | null) => {
  if (!email) return "";
  const [identifier] = email.split("@");
  if (!identifier) return "";
  return identifier
    .split(/[._-]/g)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const isoFromDateInput = (value: string) => {
  if (!value) {
    return "";
  }
  const timestamp = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(timestamp.getTime())) {
    return "";
  }
  return timestamp.toISOString();
};

const dateInputFromIso = (value: string) => {
  if (!value) return "";
  if (value.length >= 10) {
    return value.slice(0, 10);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  return parsed.toISOString().slice(0, 10);
};

const deriveNameParts = (fullName: string) => {
  if (!fullName) {
    return { firstName: "", lastName: "" };


const buildDisplayName = (first: string, last: string, fallback: string) => {
  const trimmedFirst = first.trim();
  const trimmedLast = last.trim();
  const combined = [trimmedFirst, trimmedLast].filter(Boolean).join(" ");
  return combined || fallback;
};

const produceProfileUpdate = (
  previous: ProfileInfo,
  key: ProfileDetailKey,
  storedValue: string,
  fallbackDisplayName: string
) => {
  let updatedFirst = previous.firstName ?? "";
  let updatedLast = previous.lastName ?? "";
  let updatedBirthday = previous.birthday ?? "";
  let updatedJoinedDate = previous.joinedDate;
  let updatedZodiac = previous.zodiacSign;

  switch (key) {
    case "firstName":
      updatedFirst = storedValue.trim();
      break;
    case "lastName":
      updatedLast = storedValue.trim();
      break;
    case "birthday":
      updatedBirthday = storedValue;
      break;
    case "joinedDate":
      updatedJoinedDate = storedValue;
      break;
    case "zodiacSign":
      updatedZodiac = storedValue || DEFAULT_ZODIAC_SIGN;
      break;
    default:
      break;
  }

  const updatedDisplayName = buildDisplayName(updatedFirst, updatedLast, fallbackDisplayName);

  return {
    ...previous,
    firstName: updatedFirst,
    lastName: updatedLast,
    birthday: updatedBirthday,
    joinedDate: updatedJoinedDate,
    zodiacSign: updatedZodiac,
    name: updatedDisplayName,
  };
};

  }
  const parts = fullName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
};

const getZodiacEmoji = (value: string) =>
  ZODIAC_SIGNS.find((entry) => entry.value === value)?.emoji ?? "♈";

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

const getDayOfYear = (date: Date) => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  const day = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, day);
};

const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

type ProfileInfo = {
  photo: string;
  name: string;
  firstName?: string;
  lastName?: string;
  birthday?: string;
  joinedDate: string;
  zodiacSign: string;
};

type ProfileDetailKey = "firstName" | "lastName" | "birthday" | "zodiacSign" | "joinedDate";

type ZodiacSign = {
  value: string;
  label: string;
  emoji: string;
};

const plannerImages = [
  planner01, planner02, planner03, planner04, planner05,
  planner06, planner07, planner08, planner09, planner10,
] as const;

const fallbackImages = plannerImages.slice(0, 9);
const profileImage = plannerImages[9] ?? plannerImages[0];
const pastelPalette = ["#F8EDEB", "#E3F2FD", "#E8F8F5", "#FDF2F8", "#EDE9FE", "#FFF4E6"];
const CARDS_STORAGE_KEY = "planner.cards";
const NOTES_STORAGE_KEY = "planner.notes";
const LEGACY_NOTES_STORAGE_KEY = "planner_daily_tasks";
const NOTE_SLOT_COUNT = 4;

const createEmptyNotes = () => Array.from({ length: NOTE_SLOT_COUNT }, () => "");
const padNotes = (values: string[]) =>
  Array.from({ length: NOTE_SLOT_COUNT }, (_, index) => values[index] ?? "");
const normalizeNotes = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return createEmptyNotes();
  }
  const sanitized = value.map((entry) => (typeof entry === "string" ? entry : ""));
  return padNotes(sanitized);
};
const mapLegacyNotes = (value: unknown): string[] => {
  if (!value || typeof value !== "object") {
    return createEmptyNotes();
  }
  const maybeTasks = (value as { tasks?: unknown }).tasks;
  if (!Array.isArray(maybeTasks)) {
    return createEmptyNotes();
  }
  const sanitized = maybeTasks.map((task) => {
    if (task && typeof task === "object" && typeof (task as { text?: unknown }).text === "string") {
      return (task as { text: string }).text;
    }
    return "";
  });
  return padNotes(sanitized);
};

const initialCards: DashboardCard[] = plannerCardRoutes.map((route, index) => ({
  id: route.id,
  title: route.title,
  image: fallbackImages[index % fallbackImages.length] ?? fallbackImages[0],
  path: route.path,
}));

const visionBoardImage = visionBoardMood;

const PlannerPage = () => {
  const navigate = useNavigate();
  const { userEmail } = useAuth();
  const { tasks } = useTasks();
  const fallbackProfileName = useMemo(() => formatNameFromEmail(userEmail), [userEmail]);
  const [profile, setProfile] = usePersistentState<ProfileInfo>(PROFILE_STORAGE_KEY, () => ({
    photo: profileImage,
    name: fallbackProfileName || DEFAULT_PROFILE_NAME,
    firstName: fallbackProfileName?.split(" ")[0] ?? "",
    lastName: "",
    birthday: "",
    joinedDate: DEFAULT_JOINED_DATE,
    zodiacSign: DEFAULT_ZODIAC_SIGN,
  }));
  const [cards] = usePersistentState<DashboardCard[]>(CARDS_STORAGE_KEY, () => initialCards);
  const cardsForDisplay = useMemo(() => {
    const latestById = new Map<string, (typeof plannerCardRoutes)[number]>(
      plannerCardRoutes.map((route) => [route.id, route])
    );
    return cards.map((card) => {
      const latest = latestById.get(card.id);
      if (!latest) {
        return card;
      }
      if (card.title === latest.title && card.path === latest.path) {
        return card;
      }
      return { ...card, title: latest.title, path: latest.path };
    });
  }, [cards]);
  const [profileDraft, setProfileDraft] = useState<ProfileInfo>(profile);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [today, setToday] = useState(() => new Date());
  const [notesList, setNotesList] = useState<string[]>(() => createEmptyNotes());
  const [activeDetailKey, setActiveDetailKey] = useState<ProfileDetailKey | null>(null);
  const [profileDetailDraft, setProfileDetailDraft] = useState("");
  const profilePhotoSrc = profile.photo || profileImage;
  const baseFullName = profile.name?.trim() || fallbackProfileName || DEFAULT_PROFILE_NAME;
  const combinedNameFromFields = [profile.firstName?.trim(), profile.lastName?.trim()].filter(Boolean).join(" ");
  const displayedName = combinedNameFromFields || baseFullName;
  const derivedNameParts = useMemo(() => deriveNameParts(displayedName), [displayedName]);
  const primaryFirstName = profile.firstName?.trim() || derivedNameParts.firstName;
  const primaryLastName = profile.lastName?.trim() || derivedNameParts.lastName;
  const profileDateInputValue = profileDraft.joinedDate ? dateInputFromIso(profileDraft.joinedDate) : "";
  const profileBirthdayInputValue = profileDraft.birthday ? dateInputFromIso(profileDraft.birthday) : "";
  const zodiacEntry = useMemo(
    () => ZODIAC_SIGNS.find((entry) => entry.value === profile.zodiacSign),
    [profile.zodiacSign]
  );
  const joinedDateLabel = useMemo(() => {
    if (!profile.joinedDate) {
      return "Date inconnue";
    }
    const parsed = new Date(profile.joinedDate);
    if (Number.isNaN(parsed.getTime())) {
      return "Date inconnue";
    }
    return joinedDateFormatter.format(parsed);
  }, [profile.joinedDate]);
  const birthdayLabel = useMemo(() => {
    if (!profile.birthday) {
      return "Non précisée";
    }
    const parsed = new Date(profile.birthday);
    if (Number.isNaN(parsed.getTime())) {
      return "Non précisée";
    }
    return birthdayFormatter.format(parsed);
  }, [profile.birthday]);
  const isCustomPhoto = Boolean(profile.photo && profile.photo !== profileImage);

  useEffect(() => {
    if (isEditingProfile) {
      return;
    }
    setProfileDraft(profile);
  }, [profile, isEditingProfile]);

  useEffect(() => {
    if (!fallbackProfileName) {
      return;
    }
    setProfile((previous) => {
      if (previous.name && previous.name !== DEFAULT_PROFILE_NAME) {
        return previous;
      }
      if (previous.name === fallbackProfileName) {
        return previous;
      }
      return { ...previous, name: fallbackProfileName };
    });
  }, [fallbackProfileName, setProfile]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const saved = window.localStorage.getItem(NOTES_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotesList(normalizeNotes(parsed));
        return;
      } catch (error) {
        console.error("Impossible de charger le bloc-notes", error);
      }
    }
    const legacy = window.localStorage.getItem(LEGACY_NOTES_STORAGE_KEY);
    if (!legacy) {
      return;
    }
    try {
      const parsedLegacy = JSON.parse(legacy);
      setNotesList(mapLegacyNotes(parsedLegacy));
    } catch (error) {
      console.error("Impossible de convertir l'ancien bloc-notes", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notesList));
  }, [notesList]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const updateClock = () => {
      setToday(new Date());
    };
    updateClock();
    const intervalId = window.setInterval(updateClock, 60000);
    return () => window.clearInterval(intervalId);
  }, []);

  const openProfilePhotoPicker = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) {
        return;
      }
      setProfile((previous) => ({ ...previous, photo: result }));
    };
    reader.onerror = () => {
      console.error("Impossible de charger la nouvelle photo de profil.");
    };
    reader.readAsDataURL(file);
    event.currentTarget.value = "";
  };

  const handleResetProfilePhoto = () => {
    setProfile((previous) => ({ ...previous, photo: profileImage }));
  };

  const handleProfileFirstNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setProfileDraft((previous) => ({ ...previous, firstName: value }));
  };

  const handleProfileLastNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setProfileDraft((previous) => ({ ...previous, lastName: value }));
  };

  const handleProfileDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    if (!value) {
      setProfileDraft((previous) => ({ ...previous, joinedDate: "" }));
      return;
    }
    const isoValue = isoFromDateInput(value);
    if (!isoValue) {
      return;
    }
    setProfileDraft((previous) => ({ ...previous, joinedDate: isoValue }));
  };

  const handleProfileBirthdayChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    if (!value) {
      setProfileDraft((previous) => ({ ...previous, birthday: "" }));
      return;
    }
    const isoValue = isoFromDateInput(value);
    if (!isoValue) {
      return;
    }
    setProfileDraft((previous) => ({ ...previous, birthday: isoValue }));
  };

  const handleProfileSignChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.currentTarget;
    setProfileDraft((previous) => ({ ...previous, zodiacSign: value }));
  };

  const handleProfileInfoSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const sanitizedFirstName = profileDraft.firstName?.trim() ?? "";
    const sanitizedLastName = profileDraft.lastName?.trim() ?? "";
    const combinedName = [sanitizedFirstName, sanitizedLastName].filter(Boolean).join(" ");
    const sanitizedName =
      combinedName || profileDraft.name.trim() || fallbackProfileName || DEFAULT_PROFILE_NAME;
    const sanitizedDate = profileDraft.joinedDate || new Date().toISOString();
    const sanitizedBirthday = profileDraft.birthday || "";
    const sanitizedSign = profileDraft.zodiacSign || DEFAULT_ZODIAC_SIGN;
    setProfile((previous) => ({
      ...previous,
      name: sanitizedName,
      firstName: sanitizedFirstName,
      lastName: sanitizedLastName,
      birthday: sanitizedBirthday,
      joinedDate: sanitizedDate,
      zodiacSign: sanitizedSign,
    }));
    setIsEditingProfile(false);
  };

  const handleCancelProfileEdit = () => {
    setProfileDraft(profile);
    setIsEditingProfile(false);
  };

  const handleNoteChange = (index: number, value: string) => {
    setNotesList((previous) => {
      const next = [...previous];
      next[index] = value;
      return next;
    });
  };

  const handleNoteClear = (index: number) => {
    setNotesList((previous) => {
      if (!previous[index]) {
        return previous;
      }
      const next = [...previous];
      next[index] = "";
      return next;
    });
  };

  const handleDetailEditStart = (key: ProfileDetailKey) => {
    let initialValue = "";
    switch (key) {
      case "firstName":
        initialValue = profile.firstName ?? "";
        break;
      case "lastName":
        initialValue = profile.lastName ?? "";
        break;
      case "birthday":
        initialValue = profile.birthday ? dateInputFromIso(profile.birthday) : "";
        break;
      case "joinedDate":
        initialValue = profile.joinedDate ? dateInputFromIso(profile.joinedDate) : "";
        break;
      case "zodiacSign":
        initialValue = profile.zodiacSign;
        break;
      default:
        break;
    }
    setActiveDetailKey(key);
    setProfileDetailDraft(initialValue);
  };

  const handleDetailDraftChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfileDetailDraft(event.currentTarget.value);
  };

  const handleDetailEditCancel = () => {
    setActiveDetailKey(null);
    setProfileDetailDraft("");
  };

  const applyProfileDetailUpdate = (key: ProfileDetailKey, storedValue: string) => {
    setProfile((previous) => {
      const fallbackDisplay = fallbackProfileName || previous.name || DEFAULT_PROFILE_NAME;
      const nextProfile = produceProfileUpdate(previous, key, storedValue, fallbackDisplay);
      setProfileDraft((draftPrevious) => ({
        ...draftPrevious,
        firstName: nextProfile.firstName,
        lastName: nextProfile.lastName,
        birthday: nextProfile.birthday,
        joinedDate: nextProfile.joinedDate,
        zodiacSign: nextProfile.zodiacSign,
        name: nextProfile.name,
      }));
      return nextProfile;
    });
  };

  const handleDetailDraftSubmit = (event?: FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
    if (!activeDetailKey) {
      return;
    }
    let storedValue = profileDetailDraft;
    if (activeDetailKey === "birthday" || activeDetailKey === "joinedDate") {
      storedValue = profileDetailDraft ? isoFromDateInput(profileDetailDraft) : "";
      if (profileDetailDraft && !storedValue) {
        return;
      }
    }
    if (activeDetailKey === "zodiacSign" && storedValue) {
      const match = ZODIAC_SIGNS.find((entry) => entry.value === storedValue);
      storedValue = match ? match.value : DEFAULT_ZODIAC_SIGN;
    }
    applyProfileDetailUpdate(activeDetailKey, storedValue);
    handleDetailEditCancel();
  };

  const renderDetailEditor = (key: ProfileDetailKey, type: "text" | "date" | "select", label: string) => (
    <form className="profile-detail-edit" onSubmit={handleDetailDraftSubmit}>
      {type === "select" ? (
        <select value={profileDetailDraft} onChange={handleDetailDraftChange} autoFocus aria-label={label}>
          {ZODIAC_SIGNS.map((sign) => (
            <option key={sign.value} value={sign.value}>
              {sign.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={profileDetailDraft}
          onChange={handleDetailDraftChange}
          autoFocus
          aria-label={label}
        />
      )}
      <div className="profile-detail-edit__actions">
        <button type="submit">OK</button>
        <button type="button" onClick={handleDetailEditCancel}>
          Annuler
        </button>
      </div>
    </form>
  );

  const renderDetailDisplay = (
    key: ProfileDetailKey,
    label: string,
    content: ReactNode,
    options?: { accent?: boolean }
  ) => (
    <div className="profile-detail-list__value-group">
      <span
        className={`profile-detail-list__value${options?.accent ? " profile-detail-list__value--zodiac" : ""}`}
      >
        {content}
      </span>
      <button
        type="button"
        className="profile-detail-list__edit"
        onClick={() => handleDetailEditStart(key)}
        aria-label={`Modifier ${label.toLowerCase()}`}
      >
        Mod.
      </button>
    </div>
  );

  const toggleProfileEditor = () => {
    if (isEditingProfile) {
      handleCancelProfileEdit();
      return;
    }
    setIsEditingProfile(true);
  };

  const todayLabel = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("fr-FR", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    const label = formatter.format(today);
    return label.charAt(0).toUpperCase() + label.slice(1);
  }, [today]);

  const progressData = useMemo<ProgressCard[]>(() => {
    const currentDayOfYear = getDayOfYear(today);
    const totalDaysInYear = isLeapYear(today.getFullYear()) ? 366 : 365;
    const daysInCurrentMonth = getDaysInMonth(today);
    const minutesSinceMidnight = today.getHours() * 60 + today.getMinutes();
    const monthProgress = ((today.getDate() - 1 + today.getHours() / 24) / daysInCurrentMonth) * 100;
    return [
      {
        key: "year",
        label: "Année",
        percent: Math.round(clampPercent((currentDayOfYear / totalDaysInYear) * 100)),
        meta: `${currentDayOfYear} / ${totalDaysInYear} jours`,
        accent: "#f472b6",
      },
      {
        key: "month",
        label: "Mois",
        percent: Math.round(clampPercent(monthProgress)),
        meta: `Jour ${today.getDate()} sur ${daysInCurrentMonth}`,
        accent: "#60a5fa",
      },
      {
        key: "day",
        label: "Journée",
        percent: Math.round(clampPercent((minutesSinceMidnight / 1440) * 100)),
        meta: `${today.getHours()}h${String(today.getMinutes()).padStart(2, "0")}`,
        accent: "#34d399",
      },
    ];
  }, [today]);

  const handleCardClick = (card: DashboardCard) => {
    const path = card.path ?? plannerCardRouteById[card.id];
    if (path) navigate(path);
  };

  const withAlpha = (hexColor: string, alpha: number) => {
    const parsed = hexColor.replace("#", "");
    const value = parseInt(parsed, 16);
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const upcomingTaskGroups: UpcomingGroup[] = useMemo(() => {
    const now = new Date();
    const tasksWithStart: UpcomingTask[] = tasks.map((task) => {
      const [year, month, day] = task.date.split("-").map(Number);
      const [hour, minute] = task.start.split(":").map(Number);
      const startDate = new Date(year, (month ?? 1) - 1, day ?? 1, hour ?? 0, minute ?? 0);
      return { ...task, startDate };
    });
    const future = tasksWithStart
      .filter((task) => task.startDate.getTime() >= now.getTime())
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    const dataset = (future.length > 0 ? future : tasksWithStart).slice(0, 6);
    if (dataset.length === 0) return [];

    const dayFormatter = new Intl.DateTimeFormat("fr-FR", { day: "2-digit" });
    const weekdayFormatter = new Intl.DateTimeFormat("fr-FR", { weekday: "long" });
    const dateFormatter = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" });

    const groups = new Map<string, UpcomingGroup>();
    let colorIndex = 0;

    dataset.forEach((task) => {
      const key = task.startDate.toISOString().split("T")[0];
      const accent = pastelPalette[colorIndex % pastelPalette.length] ?? pastelPalette[0];
      const timeRange = `${task.start} - ${task.end}`;
      const existing = groups.get(key);
      if (!existing) {
        groups.set(key, {
          key,
          accent,
          dateLabel: dateFormatter.format(task.startDate),
          dayNumber: dayFormatter.format(task.startDate),
          weekday: weekdayFormatter.format(task.startDate),
          tasks: [{ id: task.id, title: task.title, timeRange, tag: task.tag }],
        });
        colorIndex += 1;
      } else {
        existing.tasks.push({ id: task.id, title: task.title, timeRange, tag: task.tag });
      }
    });
    return Array.from(groups.values());
  }, [tasks]);

  return (
    <div className="planner-page dashboard-page">
      <div className="planner-page__breadcrumb">home</div>
      <div className="planner-page__accent-bar page-accent-bar" aria-hidden="true" />

      <section className="planner-section planner-section--dashboard" aria-label="Vue globale de ton planner">
        <div className="dashboard-content">
        {/* colonne gauche */}
        <div className="dashboard-column dashboard-column--left">
          <div className="dashboard-profile-card dashboard-panel" aria-label="Profil">
            <button
              type="button"
              className="dashboard-profile-card__edit-trigger"
              onClick={toggleProfileEditor}
              aria-label={isEditingProfile ? "Fermer l'éditeur de profil" : "Modifier les informations du profil"}
            >
              <span aria-hidden="true">{isEditingProfile ? "×" : "✎"}</span>
            </button>
            <div className="dashboard-profile-card__body">
              <div className="dashboard-profile-card__image-wrapper">
                <img
                  className="dashboard-profile-card__image"
                  src={profilePhotoSrc}
                  alt={`Photo de profil de ${displayedName}`}
                />
                <div className="dashboard-profile-card__image-tools">
                  <button
                    type="button"
                    className="dashboard-profile-card__photo-button"
                    onClick={openProfilePhotoPicker}
                    aria-label="Modifier la photo de profil"
                  >
                    ...
                  </button>
                  {isCustomPhoto ? (
                    <button
                      type="button"
                      className="dashboard-profile-card__photo-reset"
                      onClick={handleResetProfilePhoto}
                    >
                      Réinitialiser
                    </button>
                  ) : null}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="dashboard-profile-card__photo-input"
                  onChange={handleProfilePhotoChange}
                  aria-label="Choisir une nouvelle photo de profil"
                />
              </div>

              <div className="dashboard-profile-card__identity">
                <p className="dashboard-profile-card__name">{displayedName}</p>
                <div className="dashboard-profile-card__details">
                  <ul className="profile-detail-list">
                    <li>
                      <span className="profile-detail-list__label">Prénom</span>
                      <div className="profile-detail-list__value-wrapper">
                        {activeDetailKey === "firstName"
                          ? renderDetailEditor("firstName", "text", "Prénom")
                          : renderDetailDisplay("firstName", "Prénom", primaryFirstName || "Non précisé")}
                      </div>
                    </li>
                    <li>
                      <span className="profile-detail-list__label">Nom</span>
                      <div className="profile-detail-list__value-wrapper">
                        {activeDetailKey === "lastName"
                          ? renderDetailEditor("lastName", "text", "Nom")
                          : renderDetailDisplay("lastName", "Nom", primaryLastName || "Non précisé")}
                      </div>
                    </li>
                    <li>
                      <span className="profile-detail-list__label">Anniversaire</span>
                      <div className="profile-detail-list__value-wrapper">
                        {activeDetailKey === "birthday"
                          ? renderDetailEditor("birthday", "date", "Date d'anniversaire")
                          : renderDetailDisplay("birthday", "Anniversaire", birthdayLabel)}
                      </div>
                    </li>
                    <li>
                      <span className="profile-detail-list__label">Signe astrologique</span>
                      <div className="profile-detail-list__value-wrapper">
                        {activeDetailKey === "zodiacSign"
                          ? renderDetailEditor("zodiacSign", "select", "Signe astrologique")
                          : renderDetailDisplay(
                              "zodiacSign",
                              "Signe astrologique",
                              <>
                                <span className="dashboard-profile-card__zodiac-emoji">
                                  {zodiacEntry?.emoji ?? getZodiacEmoji(profile.zodiacSign)}
                                </span>
                                {zodiacEntry?.value ?? profile.zodiacSign}
                              </>,
                              { accent: true }
                            )}
                      </div>
                    </li>
                    <li>
                      <span className="profile-detail-list__label">Arrivée</span>
                      <div className="profile-detail-list__value-wrapper">
                        {activeDetailKey === "joinedDate"
                          ? renderDetailEditor("joinedDate", "date", "Date d'arrivée")
                          : renderDetailDisplay("joinedDate", "Arrivée", joinedDateLabel)}
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {isEditingProfile ? (
              <form className="dashboard-profile-card__form" onSubmit={handleProfileInfoSubmit}>
                <div className="dashboard-profile-card__form-grid">
                  <label>
                    <span>Prénom</span>
                    <input
                      type="text"
                      value={profileDraft.firstName ?? primaryFirstName}
                      onChange={handleProfileFirstNameChange}
                      placeholder="Ton prénom"
                    />
                  </label>
                  <label>
                    <span>Nom</span>
                    <input
                      type="text"
                      value={profileDraft.lastName ?? primaryLastName}
                      onChange={handleProfileLastNameChange}
                      placeholder="Ton nom"
                    />
                  </label>
                </div>
                <label>
                  <span>Date d'anniversaire</span>
                  <input type="date" value={profileBirthdayInputValue} onChange={handleProfileBirthdayChange} />
                </label>
                <label>
                  <span>Date d'arrivée</span>
                  <input type="date" value={profileDateInputValue} onChange={handleProfileDateChange} />
                </label>
                <label>
                  <span>Signe astrologique</span>
                  <select value={profileDraft.zodiacSign} onChange={handleProfileSignChange}>
                    {ZODIAC_SIGNS.map((sign) => (
                      <option key={sign.value} value={sign.value}>
                        {sign.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="dashboard-profile-card__form-actions">
                  <button type="submit">Enregistrer</button>
                  <button type="button" onClick={handleCancelProfileEdit}>
                    Annuler
                  </button>
                </div>
              </form>
            ) : null}

            <div className="dashboard-progress">
              <div className="dashboard-progress__header">
                <p className="dashboard-progress__eyebrow">Progression</p>
              </div>
              <article className="progress-summary">
                {progressData.map((entry) => (
                  <div key={entry.key} className="progress-summary__metric">
                    <div className="progress-summary__head">
                      <span className="progress-summary__label">{entry.label}</span>
                      <span className="progress-summary__percent">{entry.percent}%</span>
                    </div>
                    <div className="progress-summary__bar">
                      <div
                        className="progress-summary__bar-fill"
                        style={{ width: `${entry.percent}%`, background: entry.accent }}
                      />
                    </div>
                  </div>
                ))}
              </article>
            </div>

            <div className="dashboard-notes">
              <h3>Bloc note</h3>
              <ul className="dashboard-notes__list">
                {notesList.map((note, index) => (
                  <li key={index}>
                    <span className="dashboard-notes__index">{index + 1}.</span>
                    <textarea
                      className="dashboard-notes__input"
                      value={note}
                      onChange={(event) => handleNoteChange(index, event.currentTarget.value)}
                      placeholder={`Note ${index + 1}`}
                    />
                    {note ? (
                      <button
                        type="button"
                        className="dashboard-notes__clear"
                        onClick={() => handleNoteClear(index)}
                        aria-label={`Effacer la note ${index + 1}`}
                      >
                        Effacer
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* colonne centrale */}
        <div className="dashboard-column dashboard-column--center">
          <div className="dashboard-date">
            <span>Aujourd'hui</span>
            <time>{todayLabel}</time>
          </div>
          <div className="dashboard-space-title">Mon espace d’équilibre</div>
          <div className="dashboard-card-grid">
            {cardsForDisplay.map((card) => (
              <button key={card.id} type="button" className="dashboard-card" onClick={() => handleCardClick(card)}>
                <img src={card.image} alt={card.title} />
                <span className="dashboard-card__title">{card.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* colonne droite */}
        <aside className="dashboard-column dashboard-column--right">
          <div className="dashboard-upcoming dashboard-panel">
            <div className="dashboard-upcoming__header">
              <span className="dashboard-upcoming__title">Prochaines tâches</span>
              <span className="dashboard-upcoming__subtitle">Ton prochain focus, tout en douceur pastel.</span>
            </div>
            {upcomingTaskGroups.length === 0 ? (
              <div className="dashboard-upcoming__empty">
                <span>Aucune échéance à venir. Profite de ce calme.</span>
              </div>
            ) : (
              upcomingTaskGroups.map((group) => (
                <div
                  key={group.key}
                  className="dashboard-upcoming__day"
                  style={{
                    background: `linear-gradient(140deg, ${withAlpha(group.accent, 0.35)} 0%, ${withAlpha(group.accent, 0.18)} 100%)`,
                    boxShadow: `0 18px 40px ${withAlpha(group.accent, 0.28)}`,
                    borderColor: group.accent,
                  }}
                >
                  <div className="dashboard-upcoming__date">
                    <span className="dashboard-upcoming__day-number">{group.dayNumber}</span>
                    <span className="dashboard-upcoming__weekday">{group.weekday}</span>
                    <span className="dashboard-upcoming__full-date">{group.dateLabel}</span>
                  </div>
                  <ul className="dashboard-upcoming__tasks">
                    {group.tasks.map((task) => (
                      <li key={task.id} className="dashboard-upcoming__task">
                        <span className="dashboard-upcoming__time">{task.timeRange}</span>
                        <div className="dashboard-upcoming__task-info">
                          <span className="dashboard-upcoming__task-title">{task.title}</span>
                          <span className="dashboard-upcoming__tag">{task.tag}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </aside>
        </div>
      </section>

      <div className="planner-page__footer-bar page-footer-bar" aria-hidden="true" />
      <section className="planner-section planner-section--vision" aria-labelledby="vision-board-title">
        <div className="vision-board" aria-labelledby="vision-board-title">
          <div className="vision-board__header">
            <h2 id="vision-board-title">Ta vision board</h2>
            <p>Un espace dédié pour afficher ta vision en grand format.</p>
          </div>
          <div className="vision-board__canvas">
            <img src={visionBoardImage} alt="Vision board principale" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default PlannerPage;
