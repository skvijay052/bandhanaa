"use client";

import Image from "next/image";
import { useState } from "react";
import {
  BadgeCheck,
  BookHeart,
  Heart,
  MessageSquare,
  UserRound,
  UsersRound,
} from "lucide-react";
import styles from "./HomeShowcaseTabs.module.css";

type ShowcaseTab = "discover" | "matches" | "profile" | "requests" | "messages";

const tabs: Array<{
  id: ShowcaseTab;
  label: string;
  icon: typeof BookHeart;
}> = [
  { id: "discover", label: "Discover", icon: BookHeart },
  { id: "matches", label: "Matches", icon: UsersRound },
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "requests", label: "Requests", icon: MessageSquare },
  { id: "messages", label: "Messages", icon: MessageSquare },
];

const people = [
  { name: "Ananya, 26", role: "Product Manager", city: "Chennai", image: "/profiles/ananya.png", match: "95%" },
  { name: "Rohan, 28", role: "Software Engineer", city: "Bengaluru", image: "/profiles/rohan.png", match: "92%" },
  { name: "Priya, 27", role: "Consultant", city: "Hyderabad", image: "/profiles/priya.png", match: "89%" },
] as const;

function MatchesPreview() {
  return (
    <div className={styles.appFrame}>
      <div className={styles.appTopbar}>
        <div><strong>Matches</strong><span>People aligned with your preferences</span></div>
        <span className={styles.statusPill}>Recommended</span>
      </div>
      <div className={styles.matchGrid}>
        {people.map((person) => (
          <article key={person.name} className={styles.matchCard}>
            <div className={styles.matchPhoto}>
              <Image src={person.image} alt="" fill sizes="180px" className={styles.coverImage} />
              <span className={styles.matchScore}>{person.match} Match</span>
            </div>
            <div className={styles.matchBody}>
              <strong>{person.name} <BadgeCheck aria-hidden="true" /></strong>
              <p>{person.role}<br />{person.city}</p>
              <button type="button">View profile</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ProfilePreview() {
  return (
    <div className={styles.appFrame}>
      <div className={styles.profilePreview}>
        <div className={styles.profileHero}>
          <div className={styles.profileImage}>
            <Image src="/profiles/ananya.png" alt="" fill sizes="220px" className={styles.coverImage} />
          </div>
          <div className={styles.profileIntro}>
            <span className={styles.verified}>Verified profile</span>
            <h3>Ananya, 26 <BadgeCheck aria-hidden="true" /></h3>
            <p>Product Manager · Chennai, Tamil Nadu</p>
            <div className={styles.tags}><span>Family</span><span>Values</span><span>Lifestyle</span></div>
            <button type="button">Send request</button>
          </div>
        </div>
        <div className={styles.detailGrid}>
          <div><small>Education</small><strong>MBA</strong></div>
          <div><small>Mother Tongue</small><strong>Tamil</strong></div>
          <div><small>Lifestyle</small><strong>Balanced</strong></div>
          <div><small>Horoscope</small><strong>Available</strong></div>
        </div>
      </div>
    </div>
  );
}

function RequestsPreview() {
  const requestPeople = [people[0], people[2], people[1]];
  return (
    <div className={styles.appFrame}>
      <div className={styles.appTopbar}>
        <div><strong>Requests</strong><span>People who want to connect with you</span></div>
        <span className={styles.statusPill}>3 new</span>
      </div>
      <div className={styles.requestList}>
        {requestPeople.map((person, index) => (
          <article key={person.name} className={styles.requestRow}>
            <div className={styles.requestAvatar}>
              <Image src={person.image} alt="" fill sizes="72px" className={styles.coverImage} />
            </div>
            <div className={styles.requestInfo}>
              <strong>{person.name} <BadgeCheck aria-hidden="true" /></strong>
              <p>{person.role} · {person.city}</p>
              <span>{index === 0 ? "Interested in connecting with you" : "Sent you a connection request"}</span>
            </div>
            <div className={styles.requestActions}>
              <button type="button" className={styles.accept}>Accept</button>
              <button type="button" className={styles.secondary}>View</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function MessagesPreview() {
  return (
    <div className={`${styles.appFrame} ${styles.messageFrame}`}>
      <aside className={styles.chatList}>
        <strong>Messages</strong>
        {people.map((person, index) => (
          <div key={person.name} className={`${styles.chatPerson} ${index === 0 ? styles.chatPersonActive : ""}`}>
            <div className={styles.chatAvatar}>
              <Image src={person.image} alt="" fill sizes="48px" className={styles.coverImage} />
            </div>
            <div><b>{person.name.split(",")[0]}</b><span>{index === 0 ? "That sounds wonderful 😊" : "Thanks for connecting"}</span></div>
          </div>
        ))}
      </aside>
      <div className={styles.chatPane}>
        <div className={styles.chatHeader}>
          <div className={styles.chatAvatar}><Image src="/profiles/ananya.png" alt="" fill sizes="48px" className={styles.coverImage} /></div>
          <div><strong>Ananya</strong><span>Online</span></div>
        </div>
        <div className={styles.chatMessages}>
          <span className={styles.messageReceived}>Hi! Nice to connect with you.</span>
          <span className={styles.messageSent}>Likewise. I enjoyed reading your profile.</span>
          <span className={styles.messageReceived}>That sounds wonderful 😊</span>
        </div>
        <div className={styles.chatComposer}><span>Write a message...</span><Heart aria-hidden="true" /></div>
      </div>
    </div>
  );
}

function ActivePreview({ active }: { active: ShowcaseTab }) {
  if (active === "discover") {
    return (
      <div className={styles.discoverArtwork}>
        <Image
          src="/home/product-devices.png"
          alt="Bandhanaa Discover experience on desktop and mobile"
          fill
          sizes="(max-width: 899px) 100vw, 65vw"
          quality={90}
          className={styles.containImage}
        />
      </div>
    );
  }
  if (active === "matches") return <MatchesPreview />;
  if (active === "profile") return <ProfilePreview />;
  if (active === "requests") return <RequestsPreview />;
  return <MessagesPreview />;
}

export function HomeShowcaseTabs() {
  const [active, setActive] = useState<ShowcaseTab>("discover");

  return (
    <section id="discover" className={styles.showcase} aria-labelledby="showcase-title">
      <div className={styles.copy}>
        <p className={styles.eyebrow}>A closer look</p>
        <h2 id="showcase-title" className={styles.title}>Thoughtfully designed<br />for your journey.</h2>
        <p className={styles.body}>Explore, connect and communicate in a clean, modern and distraction-free space built for meaningful relationships.</p>
        <div className={styles.tabs} role="tablist" aria-label="Explore Bandhanaa features">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active === id}
              aria-controls={`showcase-panel-${id}`}
              className={`${styles.tab} ${active === id ? styles.tabActive : ""}`}
              onClick={() => setActive(id)}
            >
              <Icon aria-hidden="true" strokeWidth={1.5} />
              {label}
            </button>
          ))}
        </div>
      </div>
      <div
        key={active}
        id={`showcase-panel-${active}`}
        role="tabpanel"
        className={styles.preview}
        aria-label={`${tabs.find((tab) => tab.id === active)?.label ?? "Bandhanaa"} preview`}
      >
        <ActivePreview active={active} />
      </div>
    </section>
  );
}
