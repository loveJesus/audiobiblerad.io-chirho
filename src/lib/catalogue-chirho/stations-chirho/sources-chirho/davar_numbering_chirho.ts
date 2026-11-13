// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Which Davar recordings are read as counting Joel and Malachi the way Hebrew Bibles do.
// Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.
//
// The crosswalk itself is standard:
// - English Joel 2:28-32 is Hebrew Joel 3:1-5, English Joel 3:1-21 is Hebrew Joel 4:1-21, and
//   English Malachi 4:1-6 is Hebrew Malachi 3:19-24. The SBL Handbook of Style, appendix E,
//   https://cpb-us-w2.wpmucdn.com/voices.uchicago.edu/dist/2/96/files/2016/06/the-sbl-handbook-of-stylesblhs-2f93p03.pdf
//   and SIL's English versification file,
//   https://github.com/sillsdev/ptx2pdf/blob/master/python/lib/ptxprint/eng.vrs
// Those sources support the crosswalk. They say nothing about any one recording.
//
// Which recordings follow it is a judgement from their file lists alone: each one below lists a
// Joel 4, a Malachi 3 and no Malachi 4. Nobody has listened to them and Davar has not confirmed
// it. Each was reviewed by name and approved for this reading by the project's coordinator on
// 2026-11-13. A recording that is not named here is never remapped, whatever its list holds,
// and a new reading of the library that disagrees with this list stops the build.

/** The recordings approved for the Hebrew reading of Joel, by Davar's own recording id. */
export const DAVAR_HEBREW_JOEL_APPROVED_CHIRHO: ReadonlySet<string> = new Set([
	'ALZCDUBS_DAVR_FB_N',
	'BAXBSCAM_DAVR_OT_N',
	'BBAABB_DAVR_OT_N',
	'BCIBSCTI_DAVR_OT_N',
	'BEQBSCNG_DAVR_FB_N',
	'BIBABF_DAVR_OT_N',
	'BMQABM_DAVR_OT_N',
	'BUDBSTG_DAVR_OT_N',
	'BWQABF_DAVR_OT_N',
	'BXGBSDRC_DAVR_FB_N',
	'BYVBSCAM_DAVR_OT_N',
	'DGIABF_DAVR_OT_N',
	'DOPABB_DAVR_OT_N',
	'DTSABM_DAVR_OT_N',
	'DYIWBT_DAVR_OT_N',
	'DYUABF_DAVR_OT_N',
	'FLRWBT_DAVR_OT_N',
	'FONABB_DAVR_OT_N',
	'FRABSF_DAVR_FB_N',
	'FUBBSCAM_DAVR_FB_N',
	'FUESIM_DAVR_FB_N',
	'GEJBSTG_DAVR_OT_N',
	'GIDBSCAM_DAVR_OT_N',
	'GIZBSC_DAVR_OT_N',
	'GUXABF_DAVR_OT_N',
	'GYABSC_DAVR_OT_N',
	'KINBSR_DAVR_OT_N',
	'KNGBSDRC_DAVR_FB_N',
	'KNYBSDRC_DAVR_FB_N',
	'KTUBSDRC_DAVR_FB_N',
	'KVJBSCAM_DAVR_OT_N',
	'LDIBSCNG_DAVR_FB_N',
	'LEDBSDRC_DAVR_FB_N',
	'LEEABF_DAVR_OT_N',
	'LINBIB_DAVR_FB_N',
	'LINBSDRC_DAVR_FB_N',
	'LUBBSDRC_DAVR_FB_N',
	'MCNBSCAM_DAVR_OT_N',
	'MOSABF_DAVR_OT_N',
	'MWMBSC_DAVR_OT_N',
	'NGABSDRC_DAVR_FB_N',
	'NNWANTBA_DAVR_FB_N',
	'NZBBSGA_DAVR_OT_N',
	'PLTMBS_DAVR_OT_N',
	'POHBSGU_DAVR_OT_N',
	'PUUBSCAM_DAVR_OT_N',
	'RMCWFW_DAVR_OT_N',
	'SAGSBC_DAVR_OT_N',
	'SBABSC_DAVR_FB_N',
	'SBDABF_DAVR_OT_N',
	'SEFACI_DAVR_OT_N',
	'SHRBSDRC_DAVR_FB_N',
	'SUSPBT_DAVR_FB_N',
	'TBZABB_DAVR_OT_N',
	'TGWACI_DAVR_OT_N',
	'TODPBT_DAVR_OT_N',
	'TSVBSGA_DAVR_OT_N',
	'TUIBSCAM_DAVR_OT_N',
	'YALPBT_DAVR_OT_N'
]);

/**
 * Recordings that list a Joel 4 but not in the Hebrew pattern, so they are left as they are:
 * their Joel 4 file plays nowhere until someone works out what it holds.
 * Batak Toba and Fang, Old Testament.
 */
export const DAVAR_JOEL_LEFT_AS_IS_CHIRHO: ReadonlySet<string> = new Set([
	'BBCLAI_DAVR_OT_N',
	'FANBSGA_DAVR_OT_N'
]);
