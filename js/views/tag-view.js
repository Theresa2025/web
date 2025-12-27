if (confirm("Tag wirklich löschen?")) {
    const ok = model.deleteTag(tagId);
    if (!ok) alert("Tag wird noch verwendet und darf nicht gelöscht werden.");
}
