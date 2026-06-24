import { meadowTheme } from "@/constants/meadow-theme";

export const crisisResources = [
  {
    body: "Call or text 988",
    icon: require("@/assets/images/profile/support-phone.png"),
    subtext: "24/7 - Free - Confidential",
    title: "988 Lifeline",
    url: "tel:988",
  },
  {
    body: "Text HOME to 741741",
    icon: require("@/assets/images/profile/support-text.png"),
    subtext: "24/7 - Free - Confidential",
    title: "Crisis Text Line",
    url: "sms:741741&body=HOME",
  },
] as const;

export const griefSupportOrganizations = [
  {
    accent: meadowTheme.colors.lavender,
    description: "For families after the loss of a child.",
    initial: "C",
    name: "The Compassionate Friends",
    url: "https://www.compassionatefriends.org",
  },
  {
    accent: meadowTheme.colors.sage,
    description: "Grief recovery support groups nationwide.",
    initial: "G",
    name: "GriefShare",
    url: "https://www.griefshare.org",
  },
  {
    accent: meadowTheme.colors.lavender,
    description: "Education, community, and honest resources.",
    initial: "W",
    name: "What's Your Grief",
    url: "https://whatsyourgrief.com",
  },
  {
    accent: meadowTheme.colors.clay,
    description: "Stories of healing from those who've grieved.",
    initial: "O",
    name: "Open to Hope",
    url: "https://www.opentohope.com",
  },
  {
    accent: meadowTheme.colors.winterBlue,
    description: "For children, teens, and the adults who love them.",
    initial: "N",
    name: "National Alliance for Grieving Children",
    url: "https://childrengrieve.org",
  },
  {
    accent: meadowTheme.colors.clay,
    description: "Loss survivors, prevention, and healing.",
    initial: "A",
    name: "American Foundation for Suicide Prevention",
    url: "https://afsp.org",
  },
  {
    accent: meadowTheme.colors.sage,
    description: "Community and support for widowed people.",
    initial: "S",
    name: "Soaring Spirits International",
    url: "https://soaringspirits.org",
  },
] as const;
