import type { FormEvent, KeyboardEvent as ReactKeyboardEvent, MouseEvent } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import type { ChangeEvent } from "react"
import usePersistentState from "../hooks/usePersistentState"
import wishlistHair from "../assets/planner-03.jpg"
import wishlistOutfit from "../assets/planner-05.jpg"
import wishlistMakeup from "../assets/planner-01.jpg"
import wishlistElectronics from "../assets/planner-10.jpg"
import wishlistSkincare from "../assets/planner-02.jpg"
import wishlistBooks from "../assets/planner-07.jpg"
import wishlistRoom from "../assets/planner-06.jpg"
import wishlistTravel from "../assets/planner-09.jpg"
import wishlistJewelry from "../assets/planner-04.jpg"
import wishlistBag from "../assets/planner-08.jpg"

type WishlistCategoryId = string

type WishlistItem = {
  id: string
  categoryId: WishlistCategoryId
  title: string
  subtitle?: string
  imageUrl?: string
  imageName?: string
  link?: string
  subcategory?: string
}

type WishlistStorageEntry = {
  title: string
  items: WishlistItem[]
  note?: string
  isFavorite?: boolean
  accent?: string
  cover?: string
  blurb?: string
  createdAt?: number
  order?: number
}

type WishlistState = Record<WishlistCategoryId, WishlistStorageEntry>

type CategoryDefinition = {
  id: WishlistCategoryId
  label: string
  accent: string
  cover: string
  blurb: string
}

type WishlistCategoryCard = {
  id: WishlistCategoryId
  title: string
  accent: string
  cover: string
  blurb: string
  items: WishlistItem[]
  note?: string
  isFavorite: boolean
  entry: WishlistStorageEntry
  isBase: boolean
  order: number
  label: string
}

const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    id: "hair",
    label: "Hair essentials",
    accent: "#f497c0",
    cover: wishlistHair,
    blurb: "Brushes, soins et petits accessoires pour une routine cheveux complete.",
  },
  {
    id: "outfits",
    label: "Outfits",
    accent: "#fcd67d",
    cover: wishlistOutfit,
    blurb: "Idees tenues et pieces coups de coeur pour tes looks preferes.",
  },
  {
    id: "makeup",
    label: "Makeup wishlist",
    accent: "#fbcada",
    cover: wishlistMakeup,
    blurb: "Palette, gloss ou nouveaux blushs a tester absolument.",
  },
  {
    id: "electronics",
    label: "Electronic appareil",
    accent: "#c9d9ff",
    cover: wishlistElectronics,
    blurb: "Gadgets tech, accessoires photo ou outils productivite.",
  },
  {
    id: "skincare",
    label: "Skincare",
    accent: "#c1e7db",
    cover: wishlistSkincare,
    blurb: "Soins cocooning, masques favoris et indispensables glow.",
  },
  {
    id: "books",
    label: "Livres",
    accent: "#b4cfff",
    cover: wishlistBooks,
    blurb: "Romans, developpement perso et lectures inspirees.",
  },
  {
    id: "room",
    label: "Chambre",
    accent: "#d9c5ff",
    cover: wishlistRoom,
    blurb: "Deco, ambiance et petits objets cozy pour ta chambre.",
  },
  {
    id: "travel",
    label: "Voyages",
    accent: "#f6b094",
    cover: wishlistTravel,
    blurb: "Destinations ou experiences a ajouter a ta bucket list.",
  },
  {
    id: "jewelry",
    label: "Bijoux",
    accent: "#ffd4a8",
    cover: wishlistJewelry,
    blurb: "Bagues, colliers et accessoires brillants a collectionner.",
  },
  {
    id: "bag",
    label: "Sac",
    accent: "#f3b4c5",
    cover: wishlistBag,
    blurb: "Bags iconiques, tote bags pratiques et petites pochettes.",
  },
]

const CUSTOM_ACCENTS = ["#f6a6c1", "#c3d9ff", "#ffe3a7", "#c6eed7", "#fbcfe8", "#d9c5ff"] as const

const CUSTOM_COVER_POOL = [
  wishlistHair,
  wishlistOutfit,
  wishlistMakeup,
  wishlistElectronics,
  wishlistSkincare,
  wishlistBooks,
  wishlistRoom,
  wishlistTravel,
  wishlistJewelry,
  wishlistBag,
] as const

const CUSTOM_BLURB = "Ta categorie personnalisee."

const BASE_CATEGORY_IDS = new Set(CATEGORY_DEFINITIONS.map((category) => category.id))

const isBaseCategory = (id: WishlistCategoryId) => BASE_CATEGORY_IDS.has(id)

const hashString = (value: string) => {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    const char = value.charCodeAt(index)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash)
}

const getAccentForId = (id: WishlistCategoryId) =>
  CUSTOM_ACCENTS[hashString(id) % CUSTOM_ACCENTS.length] ?? CUSTOM_ACCENTS[0]

const getCoverForId = (id: WishlistCategoryId) =>
  CUSTOM_COVER_POOL[hashString(`${id}-cover`) % CUSTOM_COVER_POOL.length] ?? CUSTOM_COVER_POOL[0]

const getCategoryDefinition = (id: WishlistCategoryId) =>
  CATEGORY_DEFINITIONS.find((category) => category.id === id)

const createEntryFromDefinition = (definition: CategoryDefinition): WishlistStorageEntry => ({
  title: definition.label,
  items: [],
  note: "",
  isFavorite: false,
  accent: definition.accent,
  cover: definition.cover,
  blurb: definition.blurb,
  createdAt: Date.now(),
})

const createFallbackEntry = (id: WishlistCategoryId, title: string): WishlistStorageEntry => {
  const accent = getAccentForId(id)
  const cover = getCoverForId(id)
  return {
    title,
    items: [],
    note: "",
    isFavorite: false,
    accent,
    cover,
    blurb: CUSTOM_BLURB,
    createdAt: Date.now(),
  }
}

const buildDefaultEntry = (id: WishlistCategoryId, title?: string): WishlistStorageEntry => {
  const definition = getCategoryDefinition(id)
  if (definition) {
    const base = createEntryFromDefinition(definition)
    return title ? { ...base, title } : base
  }
  return createFallbackEntry(id, title ?? "Nouvelle categorie")
}

const buildDefaultWishlist = (): WishlistState =>
  CATEGORY_DEFINITIONS.reduce<WishlistState>((accumulator, category) => {
    accumulator[category.id] = createEntryFromDefinition(category)
    return accumulator
  }, {} as WishlistState)

type WishlistItemDraft = {
  title: string
  subtitle: string
  imageUrl: string
  imageName: string
  link: string
  subcategory: string
}

type NewCategoryDraft = {
  title: string
  blurb: string
  accent: string
  coverData: string
  coverName: string
}

const createNewCategoryDraft = (): NewCategoryDraft => ({
  title: "",
  blurb: "",
  accent: CUSTOM_ACCENTS[0] ?? "#f6a6c1",
  coverData: "",
  coverName: "",
})

const WishlistPage = () => {
  const [wishlist, setWishlist] = usePersistentState<WishlistState>("planner.wishlist", buildDefaultWishlist)
  const [openMenuFor, setOpenMenuFor] = useState<WishlistCategoryId | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<WishlistCategoryId | null>(null)
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [renamingCategoryId, setRenamingCategoryId] = useState<WishlistCategoryId | null>(null)
  const [renameDraft, setRenameDraft] = useState("")
  const [noteDraft, setNoteDraft] = useState("")
  const [itemDraft, setItemDraft] = useState<WishlistItemDraft>(() => ({
    title: "",
    subtitle: "",
    imageUrl: "",
    imageName: "",
    link: "",
    subcategory: "",
  }))
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [categoryDraft, setCategoryDraft] = useState<NewCategoryDraft>(() => createNewCategoryDraft())
  const itemImageInputRef = useRef<HTMLInputElement | null>(null)
  const categoryCoverInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setWishlist((previous) => {
      let changed = false
      const next: WishlistState = { ...previous }

      CATEGORY_DEFINITIONS.forEach((definition, index) => {
        const existing = next[definition.id]
        if (!existing) {
          next[definition.id] = createEntryFromDefinition(definition)
          changed = true
          return
        }

        let updated = existing

        if (!existing.title || existing.title.trim().length === 0) {
          updated = updated === existing ? { ...updated } : updated
          updated.title = definition.label
          changed = true
        }

        if (!existing.accent) {
          updated = updated === existing ? { ...updated } : updated
          updated.accent = definition.accent
          changed = true
        }

        if (!existing.cover) {
          updated = updated === existing ? { ...updated } : updated
          updated.cover = definition.cover
          changed = true
        }

        if (!existing.blurb) {
          updated = updated === existing ? { ...updated } : updated
          updated.blurb = definition.blurb
          changed = true
        }

        if (!existing.createdAt) {
          updated = updated === existing ? { ...updated } : updated
          updated.createdAt = Date.now() + index
          changed = true
        }

        if (typeof existing.order !== "number") {
          updated = updated === existing ? { ...updated } : updated
          updated.order = index
          changed = true
        }

        if (updated !== existing) {
          next[definition.id] = updated
        }
      })

      Object.entries(next).forEach(([id, entry], index) => {
        let updated = entry

        if (!entry.accent) {
          updated = updated === entry ? { ...updated } : updated
          updated.accent = getAccentForId(id)
          changed = true
        }

        if (!entry.cover) {
          updated = updated === entry ? { ...updated } : updated
          updated.cover = getCoverForId(id)
          changed = true
        }

        if (!entry.blurb) {
          updated = updated === entry ? { ...updated } : updated
          updated.blurb = CUSTOM_BLURB
          changed = true
        }

        if (!entry.createdAt) {
          updated = updated === entry ? { ...updated } : updated
          updated.createdAt = Date.now() + index
          changed = true
        }

        if (typeof entry.order !== "number") {
          updated = updated === entry ? { ...updated } : updated
          updated.order = (entry.createdAt ?? Date.now()) + index
          changed = true
        }

        if (updated !== entry) {
          next[id] = updated
        }
      })

      return changed ? next : previous
    })
  }, [setWishlist])

  const categoryCards = useMemo<WishlistCategoryCard[]>(() => {
    const baseCards = CATEGORY_DEFINITIONS.map((definition, index) => {
      const entry = wishlist[definition.id] ?? createEntryFromDefinition(definition)
      return {
        id: definition.id,
        title: entry.title ?? definition.label,
        label: definition.label,
        accent: entry.accent ?? definition.accent,
        cover: entry.cover ?? definition.cover,
        blurb: entry.blurb ?? definition.blurb,
        items: entry.items ?? [],
        note: entry.note,
        isFavorite: entry.isFavorite ?? false,
        entry,
        isBase: true,
        order: entry.order ?? index,
      }
    })

    const extras = Object.entries(wishlist)
      .filter(([id]) => !isBaseCategory(id))
      .map(([id, entry]) => ({
        id,
        title: entry.title ?? "Nouvelle categorie",
        label: "Collection perso",
        accent: entry.accent ?? getAccentForId(id),
        cover: entry.cover ?? getCoverForId(id),
        blurb: entry.blurb ?? CUSTOM_BLURB,
        items: entry.items ?? [],
        note: entry.note,
        isFavorite: entry.isFavorite ?? false,
        entry,
        isBase: false,
        order: entry.order ?? entry.createdAt ?? Number.MAX_SAFE_INTEGER,
      }))
      .sort((a, b) => a.order - b.order)

    return [...baseCards, ...extras]
  }, [wishlist])

  useEffect(() => {
    document.body.classList.add("planner-page--white")
    return () => {
      document.body.classList.remove("planner-page--white")
    }
  }, [])

  useEffect(() => {
    if (!selectedCategoryId) {
      return
    }
    setItemDraft({
      title: "",
      subtitle: "",
      imageUrl: "",
      imageName: "",
      link: "",
      subcategory: "",
    })
    const currentNote = wishlist[selectedCategoryId]?.note ?? ""
    setNoteDraft(currentNote)
    setIsEditingNote(currentNote.trim().length > 0)
  }, [selectedCategoryId, wishlist])

  useEffect(() => {
    if (!renamingCategoryId) {
      return
    }
    const card = categoryCards.find((item) => item.id === renamingCategoryId)
    const fallback = getCategoryDefinition(renamingCategoryId)?.label ?? ""
    const title = card?.entry.title ?? card?.title ?? fallback
    setRenameDraft(title)
  }, [renamingCategoryId, categoryCards])

  useEffect(() => {
    if (!feedback) {
      return
    }
    const timeout = window.setTimeout(() => setFeedback(null), 2800)
    return () => window.clearTimeout(timeout)
  }, [feedback])

  useEffect(() => {
    const handleGlobalPointerDown = () => {
      setOpenMenuFor(null)
    }
    window.addEventListener("pointerdown", handleGlobalPointerDown)
    return () => window.removeEventListener("pointerdown", handleGlobalPointerDown)
  }, [])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return
      }
      if (renamingCategoryId) {
        setRenamingCategoryId(null)
        return
      }
      if (selectedCategoryId) {
        setSelectedCategoryId(null)
        setIsAddingItem(false)
        setIsEditingNote(false)
      }
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [renamingCategoryId, selectedCategoryId])

  const selectedCategoryCard = useMemo(() => {
    if (!selectedCategoryId) {
      return null
    }
    return categoryCards.find((item) => item.id === selectedCategoryId) ?? null
  }, [categoryCards, selectedCategoryId])

  const selectedCategoryState = selectedCategoryCard?.entry ?? null
  const groupedSelectedItems = useMemo(() => {
    if (!selectedCategoryState) {
      return []
    }
    const groups = new Map<string, WishlistItem[]>()
    selectedCategoryState.items.forEach((item) => {
      const key = item.subcategory && item.subcategory.trim().length > 0 ? item.subcategory.trim() : "__uncategorized"
      const current = groups.get(key)
      if (current) {
        current.push(item)
      } else {
        groups.set(key, [item])
      }
    })
    return Array.from(groups.entries()).map(([key, items]) => ({
      key,
      label: key === "__uncategorized" ? "Sans sous-categorie" : key,
      items,
    }))
  }, [selectedCategoryState])

  const subcategoryOptions = useMemo(() => {
    if (!selectedCategoryState) {
      return []
    }
    const unique = new Set<string>()
    selectedCategoryState.items.forEach((item) => {
      if (item.subcategory && item.subcategory.trim().length > 0) {
        unique.add(item.subcategory.trim())
      }
    })
    return Array.from(unique).sort((a, b) => a.localeCompare(b))
  }, [selectedCategoryState])

  const handleToggleMenu = (event: MouseEvent<HTMLButtonElement>, categoryId: WishlistCategoryId) => {
    event.stopPropagation()
    event.preventDefault()
    setOpenMenuFor((current) => (current === categoryId ? null : categoryId))
  }

  const handleCardActivate = (categoryId: WishlistCategoryId) => {
    setSelectedCategoryId(categoryId)
    setOpenMenuFor(null)
    setIsAddingItem(false)
  }

  const handleCardKeyDown = (event: ReactKeyboardEvent<HTMLElement>, categoryId: WishlistCategoryId) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      handleCardActivate(categoryId)
    }
  }

  const handleItemImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      setItemDraft((previous) => ({
        ...previous,
        imageUrl: "",
        imageName: "",
      }))
      if (itemImageInputRef.current) {
        itemImageInputRef.current.value = ""
      }
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : ""
      setItemDraft((previous) => ({
        ...previous,
        imageUrl: result,
        imageName: file.name,
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleClearItemImage = () => {
    setItemDraft((previous) => ({
      ...previous,
      imageUrl: "",
      imageName: "",
    }))
    if (itemImageInputRef.current) {
      itemImageInputRef.current.value = ""
    }
  }

  const resetCategoryDraft = () => {
    setCategoryDraft(createNewCategoryDraft())
    if (categoryCoverInputRef.current) {
      categoryCoverInputRef.current.value = ""
    }
  }

  const handleCategoryCoverChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      setCategoryDraft((previous) => ({
        ...previous,
        coverData: "",
        coverName: "",
      }))
      if (categoryCoverInputRef.current) {
        categoryCoverInputRef.current.value = ""
      }
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : ""
      setCategoryDraft((previous) => ({
        ...previous,
        coverData: result,
        coverName: file.name,
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleCancelCreateCategory = () => {
    resetCategoryDraft()
    setIsCreatingCategory(false)
  }

  const handleCreateCategorySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedTitle = categoryDraft.title.trim()
    if (trimmedTitle.length === 0) {
      return
    }
    const trimmedBlurb = categoryDraft.blurb.trim()
    const newId = `custom-${Date.now()}`
    const accent =
      categoryDraft.accent.trim().length > 0 ? categoryDraft.accent.trim() : getAccentForId(newId)
    const cover = categoryDraft.coverData || getCoverForId(newId)
    const entry: WishlistStorageEntry = {
      title: trimmedTitle,
      items: [],
      note: "",
      isFavorite: false,
      accent,
      cover,
      blurb: trimmedBlurb.length > 0 ? trimmedBlurb : CUSTOM_BLURB,
      createdAt: Date.now(),
      order: Date.now(),
    }

    setWishlist((previous) => ({
      ...previous,
      [newId]: entry,
    }))
    setIsCreatingCategory(false)
    resetCategoryDraft()
    setSelectedCategoryId(newId)
    setIsAddingItem(true)
    setOpenMenuFor(null)
    setIsEditingNote(false)
    setNoteDraft("")
    setFeedback("Nouvelle carte ajoutee")
  }

  const handleAddItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedCategoryId) {
      return
    }
    const trimmedTitle = itemDraft.title.trim()
    if (trimmedTitle.length === 0) {
      return
    }
    const trimmedSubtitle = itemDraft.subtitle.trim()
    const trimmedImage = itemDraft.imageUrl.trim()
    const trimmedLink = itemDraft.link.trim()
    const trimmedSubcategory = itemDraft.subcategory.trim()

    const nextItem: WishlistItem = {
      id: `wish-${Date.now()}`,
      categoryId: selectedCategoryId,
      title: trimmedTitle,
      subtitle: trimmedSubtitle.length > 0 ? trimmedSubtitle : undefined,
      imageUrl: trimmedImage.length > 0 ? trimmedImage : undefined,
      imageName: itemDraft.imageName.trim().length > 0 ? itemDraft.imageName.trim() : undefined,
      link: trimmedLink.length > 0 ? trimmedLink : undefined,
      subcategory: trimmedSubcategory.length > 0 ? trimmedSubcategory : undefined,
    }

    setWishlist((previous) => {
      const currentCategory = previous[selectedCategoryId] ?? buildDefaultEntry(selectedCategoryId)
      return {
        ...previous,
        [selectedCategoryId]: {
          ...currentCategory,
          items: [nextItem, ...currentCategory.items],
        },
      }
    })
    setItemDraft((previous) => ({
      ...previous,
      title: "",
      subtitle: "",
      imageUrl: "",
      imageName: "",
      link: "",
      subcategory: "",
    }))
    if (itemImageInputRef.current) {
      itemImageInputRef.current.value = ""
    }
    setIsAddingItem(false)
    setFeedback("Produit ajoute a ta wishlist")
  }

  const handleRenameSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!renamingCategoryId) {
      return
    }
    const trimmedTitle = renameDraft.trim()
    if (trimmedTitle.length === 0) {
      return
    }
    setWishlist((previous) => ({
      ...previous,
      [renamingCategoryId]: {
        ...(previous[renamingCategoryId] ?? {
          title: trimmedTitle,
          items: [],
          note: "",
          isFavorite: false,
        }),
        title: trimmedTitle,
      },
    }))
    setRenamingCategoryId(null)
    setFeedback("Categorie renommee avec succes")
  }

  const handleResetCategory = (categoryId: WishlistCategoryId) => {
    const isCustom = !isBaseCategory(categoryId)
    setWishlist((previous) => {
      if (isCustom) {
        if (!previous[categoryId]) {
          return previous
        }
        const next = { ...previous }
        delete next[categoryId]
        return next
      }

      const definition = getCategoryDefinition(categoryId)
      const existing = previous[categoryId]
      if (!existing && !definition) {
        return previous
      }

      return {
        ...previous,
        [categoryId]: {
          ...(existing ?? buildDefaultEntry(categoryId)),
          title: existing?.title ?? definition?.label ?? "Categorie",
          items: [],
          note: "",
          isFavorite: existing?.isFavorite ?? false,
          accent: existing?.accent ?? definition?.accent ?? getAccentForId(categoryId),
          cover: existing?.cover ?? definition?.cover ?? getCoverForId(categoryId),
          blurb: existing?.blurb ?? definition?.blurb ?? CUSTOM_BLURB,
        },
      }
    })
    if (selectedCategoryId === categoryId) {
      setIsAddingItem(false)
      setIsEditingNote(false)
      setNoteDraft("")
      if (isCustom) {
        setSelectedCategoryId(null)
      }
    }
    setOpenMenuFor(null)
    setFeedback(isCustom ? "Carte supprimee" : "Categorie nettoyee")
  }

  const handleShareCategory = async (categoryId: WishlistCategoryId) => {
    const categoryState = wishlist[categoryId]
    const card = categoryCards.find((item) => item.id === categoryId)
    const categoryTitle = categoryState?.title ?? card?.title ?? "Wishlist"
    const items = categoryState?.items ?? []
    const summaryLines = [
      `Wishlist - ${categoryTitle}`,
      "",
      ...items.map((item, index) => {
        const labelParts = [`${index + 1}. ${item.title}`]
        if (item.subtitle) {
          labelParts.push(`(${item.subtitle})`)
        }
        if (item.subcategory) {
          labelParts.push(`[${item.subcategory}]`)
        }
        if (item.link) {
          labelParts.push(`-> ${item.link}`)
        }
        return labelParts.join(" ")
      }),
    ]
    if (categoryState?.note && categoryState.note.trim().length > 0) {
      summaryLines.push("", `Note : ${categoryState.note.trim()}`)
    }
    const summary = summaryLines.join("\n")
    const nav = window.navigator as Navigator & {
      share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>
      clipboard?: Clipboard
    }

    try {
      if (typeof nav.share === "function") {
        await nav.share({ title: categoryTitle, text: summary })
        setFeedback("Ta wishlist a ete partagee")
      } else if (nav.clipboard) {
        await nav.clipboard.writeText(summary)
        setFeedback("Wishlist copiee dans le presse-papiers")
      } else {
        window.prompt("Copie ta wishlist :", summary)
      }
    } catch (error) {
      console.error("Share wishlist failed", error)
      setFeedback("Impossible de partager pour le moment")
    }
    setOpenMenuFor(null)
  }

  const handleToggleFavorite = (categoryId: WishlistCategoryId) => {
    setWishlist((previous) => {
      const current = previous[categoryId]
      if (!current) {
        return previous
      }
      return {
        ...previous,
        [categoryId]: {
          ...current,
          isFavorite: !current.isFavorite,
        },
      }
    })
  }

  const handleSaveNote = () => {
    if (!selectedCategoryId) {
      return
    }
    setWishlist((previous) => {
      const current = previous[selectedCategoryId]
      if (!current) {
        return previous
      }
      return {
        ...previous,
        [selectedCategoryId]: {
          ...current,
          note: noteDraft.trim(),
        },
      }
    })
    setIsEditingNote(noteDraft.trim().length > 0)
    setFeedback("Note mise a jour")
  }

  const closeModal = () => {
    setSelectedCategoryId(null)
    setIsAddingItem(false)
    setIsEditingNote(false)
    setNoteDraft("")
  }

  return (
    <div className="wishlist-page aesthetic-page" onClick={() => setOpenMenuFor(null)}>
      <div className="wishlist-page__breadcrumb">wishlist</div>
      <header className="wishlist-hero dashboard-panel">
        <div className="wishlist-hero__content">
          <span className="wishlist-hero__eyebrow">envies a collectionner</span>
          <h1>Imagine ta wishlist ideale, categorie par categorie.</h1>
          <p>
            Organise tes inspirations shopping, deco ou voyages en un seul espace pastel. Chaque categorie devient une
            mini moodboard pret a etre partage.
          </p>
        </div>
        <div className="wishlist-hero__actions">
          <button
            type="button"
            onClick={() => {
              resetCategoryDraft()
              setIsCreatingCategory(true)
            }}
          >
            Ajouter une carte
          </button>
        </div>
      </header>

      <section className="wishlist-grid">
        {categoryCards.map((category) => {
          const itemCount = category.items.length
          const displayTitle = category.title
          const isFavorite = category.isFavorite

          return (
            <article
              key={category.id}
              className="wishlist-card"
              role="button"
              tabIndex={0}
              onClick={() => handleCardActivate(category.id)}
              onKeyDown={(event) => handleCardKeyDown(event, category.id)}
            >
              <img className="wishlist-card__cover" src={category.cover} alt={`Moodboard ${displayTitle}`} />
              <div
                className="wishlist-card__overlay"
                style={{
                  background: `linear-gradient(160deg, ${category.accent} 0%, rgba(12,11,19,0.8) 100%)`,
                }}
              />
              <button
                type="button"
                className="wishlist-card__menu"
                aria-label={`Options pour ${displayTitle}`}
                onClick={(event) => handleToggleMenu(event, category.id)}
              >
                <span />
                <span />
                <span />
              </button>
              {openMenuFor === category.id ? (
                <div className="wishlist-card__menu-popover" role="menu" onClick={(event) => event.stopPropagation()}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setRenamingCategoryId(category.id)
                      setOpenMenuFor(null)
                    }}
                  >
                    Modifier
                  </button>
                  <button type="button" role="menuitem" onClick={() => handleResetCategory(category.id)}>
                    Supprimer
                  </button>
                  <button type="button" role="menuitem" onClick={() => handleShareCategory(category.id)}>
                    Partager
                  </button>
                </div>
              ) : null}
              <div className="wishlist-card__content">
                <span className="wishlist-card__count">
                  {itemCount} {itemCount > 1 ? "elements" : "element"}
                </span>
                <div className="wishlist-card__title">
                  <h2>{displayTitle}</h2>
                  {isFavorite ? <span aria-label="Categorie favorite" className="wishlist-card__favorite">?</span> : null}
                </div>
                <p>{category.blurb}</p>
              </div>
            </article>
          )
        })}
      </section>

      {selectedCategoryId && selectedCategoryCard && selectedCategoryState ? (
        <div className="wishlist-modal__backdrop" role="dialog" aria-modal="true">
          <div className="wishlist-modal">
            <button type="button" className="wishlist-modal__close" aria-label="Fermer" onClick={closeModal}>
              ×
            </button>
            <div className="wishlist-modal__cover">
              <img src={selectedCategoryCard.cover} alt={`Photo ${selectedCategoryState.title}`} />
            </div>
            <div className="wishlist-modal__body">
              <header className="wishlist-modal__header">
                <div>
                  <span className="wishlist-modal__eyebrow">{selectedCategoryCard.label}</span>
                  <h3>{selectedCategoryState.title}</h3>
                </div>
                <span className="wishlist-modal__badge">
                  {selectedCategoryState.items.length} {selectedCategoryState.items.length > 1 ? "elements" : "element"}
                </span>
              </header>

              {isEditingNote ? (
                <form
                  className="wishlist-modal__note"
                  onSubmit={(event) => {
                    event.preventDefault()
                    handleSaveNote()
                  }}
                >
                  <label>
                    <span className="wishlist-memo-label">
                      <svg className="wishlist-memo-label__icon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9l-4 4v-4a3 3 0 0 1-3-3Z" />
                      </svg>
                      <span>Memo</span>
                    </span>
                    <textarea
                      rows={3}
                      value={noteDraft}
                      onChange={(event) => setNoteDraft(event.target.value)}
                      placeholder="Ajouter des details ou un moodboard rapide..."
                    />
                  </label>
                  <div className="wishlist-modal__note-actions">
                    <button type="submit">Enregistrer</button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingNote(false)
                        setNoteDraft(selectedCategoryState.note ?? "")
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              ) : selectedCategoryState.note && selectedCategoryState.note.trim().length > 0 ? (
                <div className="wishlist-modal__note-display">
                  <strong className="wishlist-memo-label">
                    <svg className="wishlist-memo-label__icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9l-4 4v-4a3 3 0 0 1-3-3Z" />
                    </svg>
                    <span>Memo</span>
                  </strong>
                  <p>{selectedCategoryState.note}</p>
                </div>
              ) : null}

              {isAddingItem ? (
                <form className="wishlist-modal__form" onSubmit={handleAddItem}>
                  <h4>Ajouter un element</h4>
                  <label>
                    <span>Titre</span>
                    <input
                      type="text"
                      value={itemDraft.title}
                      onChange={(event) => setItemDraft((previous) => ({ ...previous, title: event.target.value }))}
                      placeholder="Nom du produit"
                      required
                    />
                  </label>
                  <label>
                    <span>Sous-titre (optionnel)</span>
                    <input
                      type="text"
                      value={itemDraft.subtitle}
                      onChange={(event) => setItemDraft((previous) => ({ ...previous, subtitle: event.target.value }))}
                      placeholder="Couleur, edition limitee..."
                    />
                  </label>
                  <label className="wishlist-modal__file-field">
                    <span>Photo</span>
                    <div className="wishlist-modal__file-field-control">
                      <input
                        ref={itemImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleItemImageChange}
                      />
                      <span className="wishlist-modal__file-name">
                        {itemDraft.imageName ? itemDraft.imageName : "Aucune image selectionnee"}
                      </span>
                      {itemDraft.imageUrl ? (
                        <button type="button" onClick={handleClearItemImage}>
                          Retirer
                        </button>
                      ) : null}
                    </div>
                  </label>
                  <label>
                    <span>Lien (optionnel)</span>
                    <input
                      type="url"
                      value={itemDraft.link}
                      onChange={(event) => setItemDraft((previous) => ({ ...previous, link: event.target.value }))}
                      placeholder="Lien boutique ou reference"
                    />
                  </label>
                  <label>
                    <span>Sous-categorie (optionnel)</span>
                    <input
                      type="text"
                      value={itemDraft.subcategory}
                      onChange={(event) => setItemDraft((previous) => ({ ...previous, subcategory: event.target.value }))}
                      placeholder="Classe ton element (ex: Accessoires)"
                      list={subcategoryOptions.length > 0 ? "wishlist-subcategories" : undefined}
                    />
                    {subcategoryOptions.length > 0 ? (
                      <datalist id="wishlist-subcategories">
                        {subcategoryOptions.map((option) => (
                          <option key={option} value={option} />
                        ))}
                      </datalist>
                    ) : null}
                  </label>
                  <footer className="wishlist-modal__form-actions">
                    <button type="submit">Enregistrer</button>
                    <button type="button" onClick={() => setIsAddingItem(false)}>
                      Annuler
                    </button>
                  </footer>
                </form>
              ) : null}

              <div className="wishlist-modal__list">
                {selectedCategoryState.items.length === 0 ? (
                  <p className="wishlist-modal__empty">
                    Aucun element encore. Clique sur + pour enregistrer tes envies dans cette categorie.
                  </p>
                ) : (
                  groupedSelectedItems.map((group) => (
                    <div key={group.key} className="wishlist-modal__group">
                      {group.key !== "__uncategorized" ? <h4>{group.label}</h4> : null}
                      <ul>
                        {group.items.map((item) => (
                          <li key={item.id}>
                            <div className="wishlist-item__media">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.title} />
                              ) : (
                                <span className="wishlist-item__placeholder" aria-hidden="true">
                                  {item.title.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="wishlist-item__details">
                              <strong>{item.title}</strong>
                              {item.subtitle ? <span>{item.subtitle}</span> : null}
                              {group.key === "__uncategorized" && item.subcategory ? (
                                <span className="wishlist-item__subcategory">{item.subcategory}</span>
                              ) : null}
                            </div>
                            {item.link ? (
                              <a className="wishlist-item__link" href={item.link} target="_blank" rel="noreferrer">
                                Voir
                              </a>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            </div>
            <footer className="wishlist-modal__actions">
              <button
                type="button"
                onClick={() => {
                  setRenamingCategoryId(selectedCategoryId)
                  setOpenMenuFor(null)
                }}
              >
                Modifier
              </button>
              <button type="button" onClick={() => setIsAddingItem((value) => !value)} aria-pressed={isAddingItem}>
                +
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditingNote((value) => !value)
                  setNoteDraft(selectedCategoryState.note ?? "")
                }}
                aria-pressed={isEditingNote}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 4h14a1 1 0 0 1 1 1v11.59l-4-4a1 1 0 0 0-1.42 0L11 16.17l-2.59-2.58A1 1 0 0 0 7 13.59l-3 3V5a1 1 0 0 1 1-1Z" />
                </svg>
              </button>
              <button
                type="button"
                className={selectedCategoryState.isFavorite ? "wishlist-modal__favorite active" : "wishlist-modal__favorite"}
                aria-pressed={selectedCategoryState.isFavorite}
                onClick={() => handleToggleFavorite(selectedCategoryId)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m12 18.26-5.67 3a1 1 0 0 1-1.45-1.05l1.09-6.35-4.58-4.46a1 1 0 0 1 .55-1.7l6.33-.92L11.33 1a1 1 0 0 1 1.34 0l2.83 5.72 6.33.92a1 1 0 0 1 .55 1.7l-4.58 4.46 1.09 6.35a1 1 0 0 1-1.45 1.05Z" />
                </svg>
              </button>
            </footer>
          </div>
        </div>
      ) : null}

      {isCreatingCategory ? (
        <div className="wishlist-modal__backdrop" role="dialog" aria-modal="true">
          <form className="wishlist-create" onSubmit={handleCreateCategorySubmit} onClick={(event) => event.stopPropagation()}>
            <h3>Nouvelle carte</h3>
            <label>
              <span>Titre</span>
              <input
                type="text"
                value={categoryDraft.title}
                onChange={(event) => setCategoryDraft((previous) => ({ ...previous, title: event.target.value }))}
                placeholder="Nom de la carte"
                required
              />
            </label>
            <label>
              <span>Description (optionnel)</span>
              <textarea
                rows={2}
                value={categoryDraft.blurb}
                onChange={(event) => setCategoryDraft((previous) => ({ ...previous, blurb: event.target.value }))}
                placeholder="Ajoute un petit texte pour la carte"
              />
            </label>
            <label>
              <span>Couleur</span>
              <input
                type="color"
                value={categoryDraft.accent}
                onChange={(event) => setCategoryDraft((previous) => ({ ...previous, accent: event.target.value }))}
              />
            </label>
            <label className="wishlist-modal__file-field">
              <span>Image de couverture</span>
              <div className="wishlist-modal__file-field-control">
                <input
                  ref={categoryCoverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCategoryCoverChange}
                />
                <span className="wishlist-modal__file-name">
                  {categoryDraft.coverName ? categoryDraft.coverName : "Aucune image selectionnee"}
                </span>
                {categoryDraft.coverData ? (
                  <button
                    type="button"
                    onClick={() =>
                      setCategoryDraft((previous) => ({
                        ...previous,
                        coverData: "",
                        coverName: "",
                      }))
                    }
                  >
                    Retirer
                  </button>
                ) : null}
              </div>
            </label>
            <div className="wishlist-create__actions">
              <button type="submit">Creer</button>
              <button type="button" onClick={handleCancelCreateCategory}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {renamingCategoryId ? (
        <div className="wishlist-modal__backdrop" role="dialog" aria-modal="true">
          <form className="wishlist-rename" onSubmit={handleRenameSubmit} onClick={(event) => event.stopPropagation()}>
            <h3>Renommer la categorie</h3>
            <label>
              <span>Nouveau titre</span>
              <input
                type="text"
                value={renameDraft}
                onChange={(event) => setRenameDraft(event.target.value)}
                placeholder="Nom de la categorie"
                required
              />
            </label>
            <div className="wishlist-rename__actions">
              <button type="submit">Enregistrer</button>
              <button type="button" onClick={() => setRenamingCategoryId(null)}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {feedback ? <div className="wishlist-toast">{feedback}</div> : null}
    </div>
  )
}

export default WishlistPage






