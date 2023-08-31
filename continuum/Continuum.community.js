var LevelAccess_AccessContinuumVersion="community";'use strict';

// media type IDs as defined in AMP
const WEB_MEDIA_TYPE_ID = 1;

/**
 * This class encapsulates all of the helper functionality Access Continuum offers for running Access Engine to test web projects.
 *
 * @hideconstructor
 */
class Continuum {

	/**
	 * @constructor
	 * @returns {Continuum}
	 */
	constructor() {
		this._accessEngineCode = null;
		this._accessibilityConcerns = null;
		this._includePotentialAccessibilityConcerns = null;

		this._driver = null;
		this._configPath = null;
		this._windowUnderTest = null;

		this._bestPracticeDataById = {};

		this._webBestPracticeIds = [];
		this._webTestNameById = {};
		this._webBestPracticeNameById = {};
		this._webStandardNameById = {};

		this._AMPReportingService = null;
		this._ElevinReportingService = null;
	}

	/**
	 * @private
	 * @returns {string}
	 */
	get accessEngineCode() {
		return this._accessEngineCode;
	}

	set accessEngineCode(accessEngineCode) {
		this._accessEngineCode = accessEngineCode;
	}

	/**
	 * @private
	 * @returns {AccessibilityConcern[]}
	 */
	get accessibilityConcerns() {
		return this._accessibilityConcerns;
	}

	set accessibilityConcerns(accessibilityConcerns) {
		this._accessibilityConcerns = accessibilityConcerns;
	}

	/**
	 * Defines whether or not accessibility concerns that require manual review are included in any of Continuum's test results.
	 * This functionality is disabled by default, but it can be enabled via {@link Continuum#setIncludePotentialAccessibilityConcerns}.
	 * If enabled, any accessibility concerns that require manual review will have {@link AccessibilityConcern#needsReview} return true.
	 *
	 * @returns {boolean}
	 */
	get includePotentialAccessibilityConcerns() {
		return this._includePotentialAccessibilityConcerns;
	}

	/**
	 * Globally sets whether or not accessibility concerns that require manual review are included in any of Continuum's test results.
	 * If enabled, any accessibility concerns that require manual review will have {@link AccessibilityConcern#needsReview} return true.
	 *
	 * This method is only available in the Pro edition of Continuum, otherwise it will return a Promise that rejects immediately.
	 *
	 * @param {boolean} includePotentialAccessibilityConcerns - whether or not accessibility concerns that require manual review should be returned in any of Continuum's test results
	 * @returns {Promise}
	 */
	async setIncludePotentialAccessibilityConcerns(includePotentialAccessibilityConcerns) {
		if (LevelAccess_AccessContinuumVersion !== "professional") {
			if (includePotentialAccessibilityConcerns) {
				console.log("setIncludePotentialAccessibilityConcerns() is not available in the Community edition of Continuum. Please upgrade to the Pro edition of Continuum for access to this method.");
			}
			includePotentialAccessibilityConcerns = false;
		}

		this._includePotentialAccessibilityConcerns = includePotentialAccessibilityConcerns;

		// Continuum needs to be reinitialized to properly propagate the changes above
		await this.setUp(this.driver, this.configPath, this.windowUnderTest);
		return true;
	}

	/**
	 * @private
	 * @returns {*}
	 */
	get driver() {
		return this._driver;
	}

	set driver(driver) {
		this._driver = driver;

		if (this.AMPReportingService) {
			this.AMPReportingService.driver = driver;
		}

		if (this.ElevinReportingService) {
			this.ElevinReportingService.driver = driver;
		}
	}

	/**
	 * @private
	 * @returns {string}
	 */
	get configPath() {
		return this._configPath;
	}

	set configPath(configPath) {
		this._configPath = configPath;
	}

	/**
	 * @private
	 * @returns {Window}
	 */
	get windowUnderTest() {
		return this._windowUnderTest;
	}

	set windowUnderTest(window) {
		this._windowUnderTest = window;

		if (this.AMPReportingService) {
			this.AMPReportingService.windowUnderTest = window;
		}

		if (this.ElevinReportingService) {
			this.ElevinReportingService.windowUnderTest = window;
		}
	}

	/**
	 * @private
	 * @returns {object}
	 */
	get bestPracticeDataById() {
		return this._bestPracticeDataById;
	}

	set bestPracticeDataById(bestPracticeDataById) {
		this._bestPracticeDataById = bestPracticeDataById;
	}

	/**
	 * @private
	 * @returns {number[]}
	 */
	get webBestPracticeIds() {
		return this._webBestPracticeIds;
	}

	set webBestPracticeIds(webBestPracticeIds) {
		this._webBestPracticeIds = webBestPracticeIds;
	}

	/**
	 * @private
	 * @returns {object}
	 */
	get webTestNameById() {
		return this._webTestNameById;
	}

	set webTestNameById(webTestNameById) {
		this._webTestNameById = webTestNameById;
	}

	/**
	 * @private
	 * @returns {object}
	 */
	get webBestPracticeNameById() {
		return this._webBestPracticeNameById;
	}

	set webBestPracticeNameById(webBestPracticeNameById) {
		this._webBestPracticeNameById = webBestPracticeNameById;
	}

	/**
	 * @private
	 * @returns {object}
	 */
	get webStandardNameById() {
		return this._webStandardNameById;
	}

	set webStandardNameById(webStandardNameById) {
		this._webStandardNameById = webStandardNameById;
	}

	/**
	 * Gets the instance of the AMP reporting service associated with this instance of Continuum.
	 * Please consult our support documentation for more information on how to report to AMP.
	 *
	 * @returns {AMPReportingService} the AMP reporting service associated with this instance of Continuum
	 */
	get AMPReportingService() {
		return this._AMPReportingService;
	}

	set AMPReportingService(AMPReportingService) {
		this._AMPReportingService = AMPReportingService;
	}

	/**
	 * Gets the instance of the Elevin reporting service associated with this instance of Continuum.
	 * Please consult our support documentation for more information on how to report to Elevin.
	 *
	 * @returns {ElevinReportingService} the Elevin reporting service associated with this instance of Continuum
	 */
	get ElevinReportingService() {
		return this._ElevinReportingService;
	}

	set ElevinReportingService(ElevinReportingService) {
		this._ElevinReportingService = ElevinReportingService;
	}

	/**
	 * Retrieves the Access Engine file contents from a local directory
	 *
	 * @private
	 */
	_retrieveAccessEngineCode() {
		switch (PlatformUtil.getRuntimeName()) {
			case "Node":
				const filePath = `${__dirname}/AccessEngine.${LevelAccess_AccessContinuumVersion}.js`;
				const fileContent = require('fs').readFileSync(filePath, 'utf8');
				this.accessEngineCode = this.createInjectableAccessEngineCode(fileContent);
				return true;
			default:
				// we assume Access Engine was already injected by something externally if we're not able to inject it from here
				return false;
		}
	}

	/**
	 * Creates injectable Access Engine code from the specified Access Engine code to allow it to be injected into a page and used.
	 * This method can be used to inject Access Engine into the page yourself rather than having Continuum do it for you.
	 *
	 * @param {string} accessEngineCode - Access Engine JavaScript code
	 * @returns {string}
	 */
	createInjectableAccessEngineCode(accessEngineCode) {
		accessEngineCode += "window.LevelAccess_Continuum_AccessEngine = LevelAccess_AccessEngine;";
		return accessEngineCode;
	}

	/**
	 * Injects Access Engine JavaScript code into the page currently under test, if necessary; if it's already injected, we do nothing.
	 * In a client-side JavaScript context, e.g. Karma, this function does nothing; it is assumed Access Engine has already been injected into the page through some other means.
	 *
	 * @private
	 */
	async _injectAccessEngine() {
		if (!this.accessEngineCode) {
			this._retrieveAccessEngineCode();
		}

		if (this.accessEngineCode) {
			if (this.driver) {
				await this.driver.executeScript(this.accessEngineCode);
			} else if (this.windowUnderTest) {
				const hasEngineAlreadyBeenInjected = !!this.windowUnderTest.LevelAccess_Continuum_AccessEngine;
				if (!hasEngineAlreadyBeenInjected) {
					this.windowUnderTest.eval(this.accessEngineCode);
				}
			}
		} else {
			if (this.windowUnderTest) {
				const hasEngineAlreadyBeenInjected = !!this.windowUnderTest.LevelAccess_Continuum_AccessEngine;
				if (!hasEngineAlreadyBeenInjected) {
					// assume Access Engine has been injected under the default namespace by something external to Continuum,
					// in which case we just need to reassign it to a different namespace
					this.windowUnderTest.LevelAccess_Continuum_AccessEngine = this.windowUnderTest.LevelAccess_AccessEngine;
				}
			}
		}
	}

	/**
	 * Gets test info from Access Engine as a JSON object whose keys are test IDs and values are metadata for the given test.
	 *
	 * @private
	 * @returns {object}
	 */
	async _getTestInfo() {
		await this._injectAccessEngine();

		let data;
		if (this.driver) {
			const testTypeJsonArrayString = this.includePotentialAccessibilityConcerns ? "[4,5]" : "[4]";
			data = await this.driver.executeScript(`return LevelAccess_Continuum_AccessEngine.getTestInfo({testType:${testTypeJsonArrayString},columns:[\"description\",\"bestPractice\",\"mediaType\"]});`);
			return data;
		} else if (this.windowUnderTest) {
			const testTypeJsonArray = this.includePotentialAccessibilityConcerns ? [4,5] : [4];
			data = this.windowUnderTest.LevelAccess_Continuum_AccessEngine.getTestInfo({
				testType: testTypeJsonArray,
				columns: ["description", "bestPractice", "mediaType"]
			});
			return data;
		}
	}

	/**
	 * Attempts to fetch best practice data from the AMP instance specified by 'ampInstanceUrl' in continuum.conf.js.
	 * If this data cannot be fetched from AMP within a timeout period of 10 seconds, this method fails gracefully, outputting any errors to the console.
	 *
	 * @private
	 * @returns {object}
	 */
	async _fetchBestPracticeData() {
		const bestPracticeData = await NetworkUtil.getFromAMP('/api/cont/bestpractices', null, false, this.driver, this.windowUnderTest);

		for (let i = 0; i < bestPracticeData.length; i++) {
			const data = bestPracticeData[i];

			const bestPracticeId = parseInt(data.bestPracticeID, 10);
			if (bestPracticeId == null) {
				continue;
			}

			const bestPracticeName = data.name;

			this.bestPracticeDataById[bestPracticeId] = data;

			if (this.webBestPracticeIds.includes(bestPracticeId)) {
				this.webBestPracticeNameById[bestPracticeId] = bestPracticeName;
			}

			if (data.standards) {
				const standards = [];
				Object.keys(data.standards).forEach((standardIdString) => {
					if (standardIdString && data.standards[standardIdString]) {
						const standardId = parseInt(standardIdString, 10);
						const standardName = data.standards[standardIdString].trim();

						if (!Configuration.getDefaultStandardIds() || Configuration.getDefaultStandardIds().includes(standardId)) {
							standards.push({
								id: standardId,
								name: standardName
							});
						}

						if (this.webBestPracticeIds.includes(bestPracticeId)) {
							this.webStandardNameById[standardId] = standardName;
						}
					}
				});
				standards.sort((a, b) => a.name.localeCompare(b.name));
				data.standards = standards;
			}
		}
	}

	/**
	 * Converts a raw JSON string of test results from Access Engine to an array of accessibility concerns.
	 * Also filters and enriches those accessibility concerns with best practice data from AMP, if available.
	 *
	 * @private
	 * @param {string} results - a raw JSON string of test results from Access Engine
	 * @returns {AccessibilityConcern[]}
	 */
	_convertAccessEngineResultsToAccessibilityConcerns(results) {
		if (!results) {
			return null;
		}

		const accessibilityConcerns = [];

		const resultsJson = JSON.parse(results);
		const haveBestPracticeData = (Object.keys(this.bestPracticeDataById).length > 0);
		for (let i = 0; i < resultsJson.length; i++) {
			const result = resultsJson[i];
			const transformedResult = {};

			transformedResult.bestPracticeId = parseInt(result.bestPracticeId, 10) || null;
			transformedResult.engineTestId = parseInt(result.engineTestId, 10) || null;

			transformedResult.needsReview = (result.testResult === 3);

			// only filter and enrich test results if a connection to the specified AMP instance could be established
			if (haveBestPracticeData) {
				const bestPracticeData = this.bestPracticeDataById[transformedResult.bestPracticeId];
				if (!bestPracticeData) {
					continue;
				}

				if (bestPracticeData.standards.length <= 0) {
					// don't surface accessibility concerns with no relevant accessibility standards
					continue;
				}

				transformedResult.bestPracticeDescription = bestPracticeData.name;
				transformedResult.severity = parseInt(bestPracticeData.severity, 10) || null;
				transformedResult.noticeability = parseInt(bestPracticeData.noticeability, 10) || null;
				transformedResult.tractability = parseInt(bestPracticeData.tractability, 10) || null;
				transformedResult.bestPracticeDetailsUrl = bestPracticeData.href;
				transformedResult.bestPracticeStandards = bestPracticeData.standards;
			}

			const accessibilityConcern = new AccessibilityConcern(
				result.path, transformedResult.engineTestId, result.attributeDetail,
				transformedResult.bestPracticeId, result.element, result.fixType,
				transformedResult.needsReview, result, transformedResult.bestPracticeDescription,
				transformedResult.severity, transformedResult.noticeability, transformedResult.tractability,
				transformedResult.bestPracticeDetailsUrl, transformedResult.bestPracticeStandards);
			accessibilityConcerns.push(accessibilityConcern);
		}

		return accessibilityConcerns;
	}

	/**
	 * Runs only the automatic Access Engine tests corresponding to the specified accessibility standards against the current page for only the specified node and all its children.
	 * Note that the IDs of the specified accessibility standards must also be specified by {@link Configuration#getAccessEngineType}, otherwise no accessibility concerns will be returned.
	 *
	 * @private
	 * @param {number[]} standardIds - the IDs of the accessibility standards to test for (invoke {@link Continuum#getSupportedStandards} for a list of these)
	 * @param {(Element|string)} targetNodeOrCssSelectorForTargetNode - the target node, or its CSS selector, to restrict accessibility testing to
	 * @returns {Promise}
	 */
	_testForStandardsImpl(standardIds, targetNodeOrCssSelectorForTargetNode) {
		const filterResults = (results) => {
			const filteredAccessibilityConcerns = [];
			if (standardIds != null && results != null) {
				results.forEach((result) => {
					const bestPracticeStandardIds = result.bestPracticeStandards ? result.bestPracticeStandards.map(x => x.id) : [];
					if (bestPracticeStandardIds.some(x => standardIds.includes(x))) {
						filteredAccessibilityConcerns.push(result);
					}
				});
			}
			return filteredAccessibilityConcerns;
		};

		return new Promise((resolve, reject) => {
			if (targetNodeOrCssSelectorForTargetNode == null) {
				this.runAllTests().then((results) => {
					this.accessibilityConcerns = filterResults(results);
					resolve(this.accessibilityConcerns);
				});
			} else {
				this.runAllTestsOnNode(targetNodeOrCssSelectorForTargetNode).then((results) => {
					this.accessibilityConcerns = filterResults(results);
					resolve(this.accessibilityConcerns);
				});
			}
		});
	}

	/**
	 * Runs only the automatic Access Engine tests corresponding to the specified best practices against the current page for only the specified node and all its children.
	 *
	 * @private
	 * @param {number[]} bestPracticeIds - the IDs of the best practices to test for (invoke {@link Continuum#getSupportedBestPractices} for a list of these, or consult AMP)
	 * @param {(Element|string)} targetNodeOrCssSelectorForTargetNode - the target node, or its CSS selector, to restrict accessibility testing to
	 * @returns {Promise}
	 */
	_testForBestPracticesImpl(bestPracticeIds, targetNodeOrCssSelectorForTargetNode) {
		const filterResults = (results) => {
			const filteredAccessibilityConcerns = [];
			if (bestPracticeIds != null && results != null) {
				results.forEach((result) => {
					if (bestPracticeIds.includes(result.bestPracticeId)) {
						filteredAccessibilityConcerns.push(result);
					}
				});
			}
			return filteredAccessibilityConcerns;
		};

		return new Promise((resolve, reject) => {
			if (targetNodeOrCssSelectorForTargetNode == null) {
				this.runAllTests().then((results) => {
					this.accessibilityConcerns = filterResults(results);
					resolve(this.accessibilityConcerns);
				});
			} else {
				this.runAllTestsOnNode(targetNodeOrCssSelectorForTargetNode).then((results) => {
					this.accessibilityConcerns = filterResults(results);
					resolve(this.accessibilityConcerns);
				});
			}
		});
	}

	/**
	 * Runs only the specified Access Engine tests against the current page for only the specified node and all its children.
	 *
	 * @private
	 * @param {number[]} accessEngineTestIds - the IDs of the automatic Access Engine tests to test for (invoke {@link Continuum#getSupportedTests} for a list of these, or consult AMP)
	 * @param {(Element|string)} targetNodeOrCssSelectorForTargetNode - the target node, or its CSS selector, to restrict accessibility testing to
	 * @returns {Promise}
	 */
	_runTestsImpl(accessEngineTestIds, targetNodeOrCssSelectorForTargetNode) {
		const filterResults = (results) => {
			const filteredAccessibilityConcerns = [];
			if (accessEngineTestIds != null && results != null) {
				results.forEach((result) => {
					if (accessEngineTestIds.includes(result.engineTestId)) {
						filteredAccessibilityConcerns.push(result);
					}
				});
			}
			return filteredAccessibilityConcerns;
		};

		return new Promise((resolve, reject) => {
			if (targetNodeOrCssSelectorForTargetNode == null) {
				this.runAllTests().then((results) => {
					this.accessibilityConcerns = filterResults(results);
					resolve(this.accessibilityConcerns);
				});
			} else {
				this.runAllTestsOnNode(targetNodeOrCssSelectorForTargetNode).then((results) => {
					this.accessibilityConcerns = filterResults(results);
					resolve(this.accessibilityConcerns);
				});
			}
		});
	}

	/**
	 * Runs only the automatic Access Engine tests of or greater than the specified severity against the current page for only the specified node and all its children.
	 *
	 * @private
	 * @param {number} minSeverity - the inclusive minimum severity of accessibility concerns to test for on a scale of 1 to 10, where 1 is the least severe and 10 is the most severe
	 * @param {(Element|string)} targetNodeOrCssSelectorForTargetNode - the target node, or its CSS selector, to restrict accessibility testing to
	 * @returns {Promise}
	 */
	_testForSeverityImpl(minSeverity, targetNodeOrCssSelectorForTargetNode) {
		const filterResults = (results) => {
			const filteredAccessibilityConcerns = [];
			if (minSeverity != null && results != null) {
				results.forEach((result) => {
					if (result.severity && result.severity >= minSeverity) {
						filteredAccessibilityConcerns.push(result);
					}
				});
			}
			return filteredAccessibilityConcerns;
		};

		return new Promise((resolve, reject) => {
			if (targetNodeOrCssSelectorForTargetNode == null) {
				this.runAllTests().then((results) => {
					this.accessibilityConcerns = filterResults(results);
					resolve(this.accessibilityConcerns);
				});
			} else {
				this.runAllTestsOnNode(targetNodeOrCssSelectorForTargetNode).then((results) => {
					this.accessibilityConcerns = filterResults(results);
					resolve(this.accessibilityConcerns);
				});
			}
		});
	}

	/**
	 * Runs only the automatic Access Engine tests of or greater than the specified tractability against the current page for only the specified node and all its children.
	 *
	 * @private
	 * @param {number} minTractability - the inclusive minimum tractability of accessibility concerns to test for on a scale of 1 to 10, where 1 is the least tractable and 10 is the most tractable
	 * @param {(Element|string)} targetNodeOrCssSelectorForTargetNode - the target node, or its CSS selector, to restrict accessibility testing to
	 * @returns {Promise}
	 */
	_testForTractabilityImpl(minTractability, targetNodeOrCssSelectorForTargetNode) {
		const filterResults = (results) => {
			const filteredAccessibilityConcerns = [];
			if (minTractability != null && results != null) {
				results.forEach((result) => {
					if (result.tractability && result.tractability >= minTractability) {
						filteredAccessibilityConcerns.push(result);
					}
				});
			}
			return filteredAccessibilityConcerns;
		};

		return new Promise((resolve, reject) => {
			if (targetNodeOrCssSelectorForTargetNode == null) {
				this.runAllTests().then((results) => {
					this.accessibilityConcerns = filterResults(results);
					resolve(this.accessibilityConcerns);
				});
			} else {
				this.runAllTestsOnNode(targetNodeOrCssSelectorForTargetNode).then((results) => {
					this.accessibilityConcerns = filterResults(results);
					resolve(this.accessibilityConcerns);
				});
			}
		});
	}

	/**
	 * Runs only the automatic Access Engine tests of or greater than the specified noticeability against the current page for only the specified node and all its children.
	 *
	 * @private
	 * @param {number} minNoticeability - the inclusive minimum noticeability of accessibility concerns to test for on a scale of 1 to 10, where 1 is the least noticeable and 10 is the most noticeable
	 * @param {(Element|string)} targetNodeOrCssSelectorForTargetNode - the target node, or its CSS selector, to restrict accessibility testing to
	 * @returns {Promise}
	 */
	_testForNoticeabilityImpl(minNoticeability, targetNodeOrCssSelectorForTargetNode) {
		const filterResults = (results) => {
			const filteredAccessibilityConcerns = [];
			if (minNoticeability != null && results != null) {
				results.forEach((result) => {
					if (result.noticeability && result.noticeability >= minNoticeability) {
						filteredAccessibilityConcerns.push(result);
					}
				});
			}
			return filteredAccessibilityConcerns;
		};

		return new Promise((resolve, reject) => {
			if (targetNodeOrCssSelectorForTargetNode == null) {
				this.runAllTests().then((results) => {
					this.accessibilityConcerns = filterResults(results);
					resolve(this.accessibilityConcerns);
				});
			} else {
				this.runAllTestsOnNode(targetNodeOrCssSelectorForTargetNode).then((results) => {
					this.accessibilityConcerns = filterResults(results);
					resolve(this.accessibilityConcerns);
				});
			}
		});
	}

	/////
	// API Functions

	/**
	 * Sets up Continuum for web testing.
	 * Either the webDriver or window parameter must be specified here.
	 *
	 * @param {?*} webDriver - a Selenium web driver to test with
	 * @param {?string} configPath - the absolute path to a valid continuum.conf.js file; null if you've already loaded this yourself
	 * @param {?Window} window - the window whose content should be tested
	 */
	async setUp(webDriver, configPath, window) {
		this.driver = webDriver;
		this.configPath = configPath;
		this.windowUnderTest = window;

		Configuration.load(configPath);

		if (this._includePotentialAccessibilityConcerns === null) {
			if (await this.setIncludePotentialAccessibilityConcerns(Configuration.getIncludePotentialAccessibilityConcerns())) {
				// on success, setIncludePotentialAccessibilityConcerns calls setUp, so no need to finish executing setUp here
				return;
			}
		}
		if (this._AMPReportingService === null) {
			this._AMPReportingService = new AMPReportingService(this._driver, this._windowUnderTest);
		}

		if (this._ElevinReportingService === null) {
			this._ElevinReportingService = new ElevinReportingService(this._driver, this._windowUnderTest);
		}

		this._retrieveAccessEngineCode();

		let testDataFetched = false;
		try {
			// inject Engine and fetch info about its automatic tests
			const testInfo = await this._getTestInfo();

			// parse and bucket test info by platform
			if (testInfo != null) {
				Object.keys(testInfo).forEach((testIdString) => {
					const testId = parseInt(testIdString, 10);
					const testInfoData = testInfo[testId];

					if (testInfoData.mediaType === 1) {
						const bestPracticeId = parseInt(testInfoData.bestPractice, 10);
						this.webBestPracticeIds.push(bestPracticeId);
						this.webTestNameById[testId] = testInfoData.description;
					}
				});

				testDataFetched = true;
			}
		} catch (err) {
			console.log(err);
		} finally {
			if (!testDataFetched) {
				console.log("Failed to fetch info about tests supported by Access Engine! Continuum is now operating in a degraded state; getSupportedTests(), getSupportedBestPractices(), and getSupportedStandards() will not return any data.");
			}
		}

		try {
			// prefetch best practice data from AMP
			await this._fetchBestPracticeData();
		} catch (err) {
			console.log("Failed to fetch enriched best practice data from AMP! Continuum is now operating in a degraded state; both getSupportedBestPractices() and getSupportedStandards() will not return any data, and accessibility concerns returned by Continuum will not be enriched with corresponding best practice data from AMP.", err);
		}
	}

	/**
	 * Sets the window to test.
	 * This can be used to set the testing context to the contents of an iframe element on the page, rather than the page an iframe element appears on.
	 *
	 * @param {Window} targetWindow - the window to inject Access Engine into and prepare to test
	 * @returns {Promise}
	 */
	setWindowUnderTest(targetWindow) {
		return new Promise((resolve, reject) => {
			const injectAccessEngine = this._injectAccessEngine();

			const execApi = new Promise((resolve, reject) => {
				if (this.driver) {
					// not supported
					reject();
				} else if (this.windowUnderTest) {
					this.windowUnderTest.LevelAccess_Continuum_AccessEngine.setWindowUnderTest(targetWindow);
					resolve();
				} else {
					reject();
				}
			});

			const arr = [injectAccessEngine, execApi];
			Promise.all(arr).then(() => {
				resolve();
			});
		});
	}

	_convertAccessEngineResultsToAssertions(results) {
		if (!results) {
			return null;
		}

		const resultsArr = JSON.parse(results);
		let assertions = [];

		resultsArr.forEach(result => {
			const assertion = {
				...Assertion.fromJSON(result)
			}
			assertions.push(assertion);
		});

		return assertions;
	}

	/**
	 * Runs all automatic Access Engine tests against the current page, as defined by the web driver used previously to invoke {@link Continuum#setUp}.
	 * Make sure to invoke this {@link Continuum#setUp} method before invoking this method.
	 *
	 * @returns {Promise}
	 */
	runAllTests() {
		return new Promise((resolve, reject) => {
			const injectAccessEngine = this._injectAccessEngine();

			const execApi = new Promise((resolve, reject) => {
				const isElevinFormat = Configuration.getAccessibilityConcernsConfiguration().format === 'elevin';

				if (this.driver) {
					const testTypeJsonArrayString = this.includePotentialAccessibilityConcerns ? "[4,5]" : "[4]";
					const script = isElevinFormat
						? `return LevelAccess_Continuum_AccessEngine.nextgen_runAllTests_returnInstances_JSON(${testTypeJsonArrayString}, true);`
						: `return LevelAccess_Continuum_AccessEngine.ast_runAllTests_returnInstances_JSON(${testTypeJsonArrayString});`;

					this.driver.executeScript(script).then((outcome) => {
						this.accessibilityConcerns = isElevinFormat
							? this._convertAccessEngineResultsToAssertions(outcome)
							: this._convertAccessEngineResultsToAccessibilityConcerns(outcome);

						resolve(this.accessibilityConcerns);
					});
				} else if (this.windowUnderTest) {
					const testTypeJsonArray = this.includePotentialAccessibilityConcerns ? [4,5] : [4];
					const outcome = isElevinFormat
						? this.windowUnderTest.LevelAccess_Continuum_AccessEngine.nextgen_runAllTests_returnInstances_JSON(testTypeJsonArray, true)
						: this.windowUnderTest.LevelAccess_Continuum_AccessEngine.ast_runAllTests_returnInstances_JSON(testTypeJsonArray);

					this.accessibilityConcerns = isElevinFormat
						? this._convertAccessEngineResultsToAssertions(outcome)
						: this._convertAccessEngineResultsToAccessibilityConcerns(outcome);
					resolve(this.accessibilityConcerns);
				} else {
					reject();
				}
			});

			const arr = [injectAccessEngine, execApi];
			Promise.all(arr).then(() => {
				resolve(this.accessibilityConcerns);
			});
		});
	}

	/**
	 * Runs only the automatic Access Engine tests corresponding to the specified accessibility standards against the current page, as defined by the web driver used previously to invoke {@link Continuum#setUp}.
	 * Note that the IDs of the specified accessibility standards must also be specified by {@link Configuration#getAccessEngineType}, otherwise no accessibility concerns will be returned.
	 * Make sure to invoke this {@link Continuum#setUp} method before invoking this method.
	 *
	 * @param {number[]} standardIds - the IDs of the accessibility standards to test for (invoke {@link Continuum#getSupportedStandards} for a list of these, or consult AMP)
	 * @returns {Promise}
	 */
	testForStandards(standardIds) {
		return this._testForStandardsImpl(standardIds, null);
	}

	/**
	 * Runs only the automatic Access Engine tests corresponding to the specified best practices against the current page, as defined by the web driver used previously to invoke {@link Continuum#setUp}.
	 * Make sure to invoke this {@link Continuum#setUp} method before invoking this method.
	 *
	 * @param {number[]} bestPracticeIds - the IDs of the best practices to test for (invoke {@link Continuum#getSupportedBestPractices} for a list of these, or consult AMP)
	 * @returns {Promise}
	 */
	testForBestPractices(bestPracticeIds) {
		return this._testForBestPracticesImpl(bestPracticeIds, null);
	}

	/**
	 * Runs only the specified automatic Access Engine tests against the current page, as defined by the web driver used previously to invoke {@link Continuum#setUp}.
	 * Make sure to invoke this {@link Continuum#setUp} method before invoking this method.
	 *
	 * @param {number[]} engineTestIds - the IDs of the automatic Access Engine tests to test for (invoke {@link Continuum#getSupportedTests} for a list of these, or consult AMP)
	 * @returns {Promise}
	 */
	runTests(engineTestIds) {
		return this._runTestsImpl(engineTestIds, null);
	}

	/**
	 * Runs only the automatic Access Engine tests of or greater than the specified severity against the current page, as defined by the web driver used previously to invoke {@link Continuum#setUp}.
	 * Make sure to invoke this {@link Continuum#setUp} method before invoking this method.
	 *
	 * @param {number} minSeverity - the inclusive minimum severity of accessibility concerns to test for on a scale of 1 to 10, where 1 is the least severe and 10 is the most severe
	 * @returns {Promise}
	 */
	testForSeverity(minSeverity) {
		return this._testForSeverityImpl(minSeverity, null);
	}

	/**
	 * Runs only the automatic Access Engine tests of or greater than the specified tractability against the current page, as defined by the web driver used previously to invoke {@link Continuum#setUp}.
	 * Make sure to invoke this {@link Continuum#setUp} method before invoking this method.
	 *
	 * @param {number} minTractability - the inclusive minimum tractability of accessibility concerns to test for on a scale of 1 to 10, where 1 is the least tractable and 10 is the most tractable
	 * @returns {Promise}
	 */
	testForTractability(minTractability) {
		return this._testForTractabilityImpl(minTractability, null);
	}

	/**
	 * Runs only the automatic Access Engine tests of or greater than the specified noticeability against the current page, as defined by the web driver used previously to invoke {@link Continuum#setUp}.
	 * Make sure to invoke this {@link Continuum#setUp} method before invoking this method.
	 *
	 * @param {number} minNoticeability - the inclusive minimum noticeability of accessibility concerns to test for on a scale of 1 to 10, where 1 is the least noticeable and 10 is the most noticeable
	 * @returns {Promise}
	 */
	testForNoticeability(minNoticeability) {
		return this._testForNoticeabilityImpl(minNoticeability, null);
	}

	/**
	 * Runs all automatic Access Engine tests against the current page for only the specified node and all its children, as defined by the web driver used previously to invoke {@link Continuum#setUp} and the specified node or its CSS selector.
	 * Make sure to invoke this {@link Continuum#setUp} method before invoking this method.
	 *
	 * @param {(Element|string)} targetNodeOrCssSelectorForTargetNode - the target node, or its CSS selector, to restrict accessibility testing to
	 * @returns {Promise}
	 */
	runAllTestsOnNode(targetNodeOrCssSelectorForTargetNode) {
		return new Promise((resolve, reject) => {
			const injectAccessEngine = this._injectAccessEngine();

			const execApi = new Promise((resolve, reject) => {
				if (this.driver) {
					if (typeof targetNodeOrCssSelectorForTargetNode === 'string' || targetNodeOrCssSelectorForTargetNode instanceof String) {
						const cssSelectorForTargetNode = targetNodeOrCssSelectorForTargetNode;
						const script = this.includePotentialAccessibilityConcerns ? `return LevelAccess_Continuum_AccessEngine.ast_runAllTests_returnInstances_JSON_NodeCapture(document.querySelector("${cssSelectorForTargetNode}"),[4,5]);` : `return LevelAccess_Continuum_AccessEngine.runAllTests_returnInstances_JSON_NodeCapture(document.querySelector("${cssSelectorForTargetNode}"));`;

						this.driver.executeScript(script).then((outcome) => {
							this.accessibilityConcerns = this._convertAccessEngineResultsToAccessibilityConcerns(outcome);
							resolve(this.accessibilityConcerns);
						});
					} else {
						// not supported
						reject();
					}
				} else if (this.windowUnderTest) {
					let targetNode;
					if (typeof targetNodeOrCssSelectorForTargetNode === 'string' || targetNodeOrCssSelectorForTargetNode instanceof String) {
						const cssSelectorForTargetNode = targetNodeOrCssSelectorForTargetNode;
						targetNode = this.windowUnderTest.document.querySelector(cssSelectorForTargetNode);
					} else {
						targetNode = targetNodeOrCssSelectorForTargetNode;
					}

					let results;
					if (this.includePotentialAccessibilityConcerns) {
						results = this.windowUnderTest.LevelAccess_Continuum_AccessEngine.ast_runAllTests_returnInstances_JSON_NodeCapture(targetNode, [4, 5]);
					} else {
						results = this.windowUnderTest.LevelAccess_Continuum_AccessEngine.runAllTests_returnInstances_JSON_NodeCapture(targetNode);
					}
					this.accessibilityConcerns = this._convertAccessEngineResultsToAccessibilityConcerns(results);

					resolve(this.accessibilityConcerns);
				} else {
					reject();
				}
			});

			const arr = [injectAccessEngine, execApi];
			Promise.all(arr).then(() => {
				resolve(this.accessibilityConcerns);
			});
		});
	}

	/**
	 * Runs only the automatic Access Engine tests corresponding to the specified accessibility standards against the current page for only the specified node and all its children, as defined by the web driver used previously to invoke {@link Continuum#setUp} and the specified node or its CSS selector.
	 * Note that the IDs of the specified accessibility standards must also be specified by {@link Configuration#getAccessEngineType}, otherwise no accessibility concerns will be returned.
	 * Make sure to invoke this {@link Continuum#setUp} method before invoking this method.
	 *
	 * @param {number[]} standardIds - the IDs of the accessibility standards to test for (invoke {@link Continuum#getSupportedStandards} for a list of these, or consult AMP)
	 * @param {(Element|string)} targetNodeOrCssSelectorForTargetNode - the target node, or its CSS selector, to restrict accessibility testing to
	 * @returns {Promise}
	 */
	testNodeForStandards(standardIds, targetNodeOrCssSelectorForTargetNode) {
		return this._testForStandardsImpl(standardIds, targetNodeOrCssSelectorForTargetNode);
	}

	/**
	 * Runs only the automatic Access Engine tests corresponding to the specified best practices against the current page for only the specified node and all its children, as defined by the web driver used previously to invoke {@link Continuum#setUp} and the specified node or its CSS selector.
	 * Make sure to invoke this {@link Continuum#setUp} method before invoking this method.
	 *
	 * @param {number[]} bestPracticeIds - the IDs of the best practices to test for (invoke {@link Continuum#getSupportedBestPractices} for a list of these, or consult AMP)
	 * @param {(Element|string)} targetNodeOrCssSelectorForTargetNode - the target node, or its CSS selector, to restrict accessibility testing to
	 * @returns {Promise}
	 */
	testNodeForBestPractices(bestPracticeIds, targetNodeOrCssSelectorForTargetNode) {
		return this._testForBestPracticesImpl(bestPracticeIds, targetNodeOrCssSelectorForTargetNode);
	}

	/**
	 * Runs only the specified automatic Access Engine tests against the current page for only the specified node and all its children, as defined by the web driver used previously to invoke {@link Continuum#setUp} and the specified node or its CSS selector.
	 * Make sure to invoke this {@link Continuum#setUp} method before invoking this method.
	 *
	 * @param {number[]} engineTestIds - the IDs of the automatic Access Engine tests to test for (invoke {@link Continuum#getSupportedTests} for a list of these, or consult AMP)
	 * @param {(Element|string)} targetNodeOrCssSelectorForTargetNode - the target node, or its CSS selector, to restrict accessibility testing to
	 * @returns {Promise}
	 */
	runTestsOnNode(engineTestIds, targetNodeOrCssSelectorForTargetNode) {
		return this._runTestsImpl(engineTestIds, targetNodeOrCssSelectorForTargetNode);
	}

	/**
	 * Runs only the automatic Access Engine tests of or greater than the specified severity against the current page for only the specified node and all its children, as defined by the web driver used previously to invoke {@link Continuum#setUp} and the specified node or its CSS selector.
	 * Make sure to invoke this {@link Continuum#setUp} method before invoking this method.
	 *
	 * @param {number} minSeverity - the inclusive minimum severity of accessibility concerns to test for on a scale of 1 to 10, where 1 is the least noticeable and 10 is the most noticeable
	 * @param {(Element|string)} targetNodeOrCssSelectorForTargetNode - the target node, or its CSS selector, to restrict accessibility testing to
	 * @returns {Promise}
	 */
	testNodeForSeverity(minSeverity, targetNodeOrCssSelectorForTargetNode) {
		return this._testForSeverityImpl(minSeverity, targetNodeOrCssSelectorForTargetNode);
	}

	/**
	 * Runs only the automatic Access Engine tests of or greater than the specified tractability against the current page for only the specified node and all its children, as defined by the web driver used previously to invoke {@link Continuum#setUp} and the specified node or its CSS selector.
	 * Make sure to invoke this {@link Continuum#setUp} method before invoking this method.
	 *
	 * @param {number} minTractability - the inclusive minimum tractability of accessibility concerns to test for on a scale of 1 to 10, where 1 is the least noticeable and 10 is the most noticeable
	 * @param {(Element|string)} targetNodeOrCssSelectorForTargetNode - the target node, or its CSS selector, to restrict accessibility testing to
	 * @returns {Promise}
	 */
	testNodeForTractability(minTractability, targetNodeOrCssSelectorForTargetNode) {
		return this._testForTractabilityImpl(minTractability, targetNodeOrCssSelectorForTargetNode);
	}

	/**
	 * Runs only the automatic Access Engine tests of or greater than the specified noticeability against the current page for only the specified node and all its children, as defined by the web driver used previously to invoke {@link Continuum#setUp} and the specified node or its CSS selector.
	 * Make sure to invoke this {@link Continuum#setUp} method before invoking this method.
	 *
	 * @param {number} minNoticeability - the inclusive minimum noticeability of accessibility concerns to test for on a scale of 1 to 10, where 1 is the least noticeable and 10 is the most noticeable
	 * @param {(Element|string)} targetNodeOrCssSelectorForTargetNode - the target node, or its CSS selector, to restrict accessibility testing to
	 * @returns {Promise}
	 */
	testNodeForNoticeability(minNoticeability, targetNodeOrCssSelectorForTargetNode) {
		return this._testForNoticeabilityImpl(minNoticeability, targetNodeOrCssSelectorForTargetNode);
	}

	/**
	 * Gets an object of key-value pairs, where the keys are IDs of accessibility standards (defined in AMP and supported by Continuum) and the values are their names.
	 * Make sure to invoke this {@link Continuum#setUp} method before invoking this method.
	 *
	 * @returns {object}
	 */
	getSupportedStandards() {
		return this.webStandardNameById;
	}

	/**
	 * Gets an object of key-value pairs, where the keys are IDs of best practices (defined in AMP and supported by Continuum) and the values are their descriptions.
	 * Make sure to invoke this {@link Continuum#setUp} method before invoking this method.
	 *
	 * @returns {object}
	 */
	getSupportedBestPractices() {
		return this.webBestPracticeNameById;
	}

	/**
	 * Gets an object of key-value pairs, where the keys are IDs of automatic Access Engine tests (supported by Continuum) and the values are their descriptions.
	 * Make sure to invoke this {@link Continuum#setUp} method before invoking this method.
	 *
	 * @returns {object}
	 */
	getSupportedTests() {
		return this.webTestNameById;
	}

	/**
	 * Gets the list of accessibility concerns found by Access Engine during the last test execution.
	 *
	 * @returns {AccessibilityConcern[]}
	 */
	getAccessibilityConcerns() {
		return this.accessibilityConcerns;
	}

	/**
	 * Retrieves the set of metadata for the current page.
	 *
	 * @returns {Metadata}
 	*/
	async getPageMetadata() {
		this._injectAccessEngine();

		const metadata = new Metadata();
		let environmentDetails = {};

		if (this.driver) {
			metadata.contentType = await this.driver.executeScript("return document.contentType");
			metadata.title = await this.driver.getTitle();
			metadata.redirectedUrl = await this.driver.getCurrentUrl();
			environmentDetails = await this.driver.executeScript("return window.LevelAccess_Continuum_AccessEngine.getEnvironmentDetails();");
			metadata.engineSuccess = await this.driver.executeScript("return window.LevelAccess_Continuum_AccessEngine.getSuccess();");
		} else if (this.windowUnderTest) {
			const { document } = this.windowUnderTest;

			metadata.contentType = document.contentType;
			metadata.title = document.title;
			metadata.redirectedUrl = document.location.href;
			environmentDetails = this.windowUnderTest.LevelAccess_Continuum_AccessEngine.getEnvironmentDetails();
			metadata.engineSuccess = this.windowUnderTest.LevelAccess_Continuum_AccessEngine.getSuccess();
		}

		metadata.width = environmentDetails.width;
		metadata.height = environmentDetails.height;
		metadata.docHeight = environmentDetails.docHeight;
		metadata.docWidth = environmentDetails.docWidth;
		metadata.orientation = environmentDetails.orientation;
		metadata.userAgent = environmentDetails.userAgent;

		return metadata;
	}

	/**
	 * @returns {String}
	 */
	static getRandomUUID() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
		}

		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	}

	/////
	// Deprecated API Functions

	/**
	 * @ignore
	 * @deprecated Renamed for clarity; use {@link Continuum#runAllTests} instead.
	 */
	runAllTests_returnInstances_JSON(callback) {
		return this.runAllTests();
	}

	/**
	 * @ignore
	 * @deprecated Renamed for clarity; use {@link Continuum#runAllTestsOnNode} instead.
	 */
	runAllTests_returnInstances_JSON_NodeCapture(targetNodeOrCssSelectorForTargetNode, callback) {
		return this.runAllTestsOnNode(targetNodeOrCssSelectorForTargetNode);
	}

	/**
	 * @ignore
	 * @deprecated Renamed for clarity; use {@link Continuum#getAccessibilityConcerns} instead.
	 */
	getA11yResults() {
		return this.getAccessibilityConcerns();
	}
}

/**
 * This class encapsulates all Continuum configuration defined in the user-editable continuum.conf.js file and related functionality.
 *
 * @hideconstructor
 */
class Configuration {

	/**
	 * @private
	 */
	static get INSTANCE() {
		return Configuration.instance;
	}

	/**
	 * Reads the configuration defined in the continuum.conf.js file and writes it to a new Configuration object.
	 * This method is not meant to be invoked directly outside the SDK internals; use {@link Continuum#setUp} instead.
	 *
	 * @ignore
	 * @param {?string} configPath - the absolute path to a valid continuum.conf.js file; null if you've already loaded this yourself
	 */
	static load(configPath) {
		let config;

		switch (PlatformUtil.getRuntimeName()) {
			case "Node":
				const fileContents = require('fs').readFileSync(configPath, 'utf8');
				const modifiedFileContents = fileContents.replace("window.LevelAccess_AccessContinuumConfiguration = ", "return ");
				config = new Function(modifiedFileContents)();
				break;
			default:
				// we assume continuum.conf.js was already injected by something externally if we're not able to inject it from here
				config = window.LevelAccess_AccessContinuumConfiguration;
				break;
		}

		const configuration = new Configuration();

		configuration.accessEngineType = config.accessEngineType;
		if ( ( config.ampInstanceUrl ) && ( config.ampInstanceUrl.trim().endsWith( "/" )  ) ) {
			const trimmedUrl = config.ampInstanceUrl.trim();
			configuration.ampInstanceUrl = trimmedUrl.substring( 0, trimmedUrl.length - 1 );
		} else {
			configuration.ampInstanceUrl = config.ampInstanceUrl;
		}
		configuration.defaultStandardIds = config.defaultStandardIds;
		configuration.includePotentialAccessibilityConcerns = config.includePotentialAccessibilityConcerns;
		configuration.ampApiToken = config.ampApiToken;

		if (config.proxy) {
			configuration.proxyConfiguration = new Configuration.Proxy();
			configuration.proxyConfiguration.host = config.proxy.host;
			configuration.proxyConfiguration.port = config.proxy.port;
			configuration.proxyConfiguration.username = config.proxy.username;
			configuration.proxyConfiguration.password = config.proxy.password;
		} else {
			configuration.proxyConfiguration = null;
		}

		if (config.elevin) {
			configuration.elevinConfiguration = new Configuration.ElevinConfiguration();
			configuration.elevinConfiguration.apiKey = config.elevin.apiKey;
		}

		if (config.elevin && config.elevin.baseUrl
			&& config.elevin.baseUrl.trim().endsWith("/")) {
			const trimmedUrl = config.elevin.baseUrl.trim();
			configuration.elevinConfiguration.baseUrl = trimmedUrl.substring(0, trimmedUrl.length - 1);
		} else {
			configuration.elevinConfiguration.baseUrl = config.elevin.baseUrl;
		}

		if (config.accessibilityConcerns) {
			configuration.accessibilityConcerns = {...config.accessibilityConcerns};
		}

		if (config.accessibilityConcerns && config.accessibilityConcerns.format) {
			configuration.useAssertions = config.accessibilityConcerns.format === 'elevin';
		}

		Configuration.instance = configuration;
	}

	/**
	 * Gets the value for the 'accessEngineType' attribute defined in continuum.conf.js.
	 * Used to determine which version of Access Engine is included with this installation of Continuum and should be used.
	 *
	 * @returns {string}
	 */
	static getAccessEngineType() {
		return Configuration.INSTANCE.accessEngineType;
	}

	/**
	 * Gets the value for the 'ampInstanceUrl' attribute defined in continuum.conf.js.
	 * The URL to the desired AMP instance from which to pull best practice data from.
	 *
	 * @returns {string}
	 */
	static getAmpInstanceUrl() {
		return Configuration.INSTANCE.ampInstanceUrl;
	}

	/**
	 * Gets the set of IDs implied from the value of the 'defaultStandardIds' attribute defined in continuum.conf.js as a comma-delimited array of IDs of the accessibility standards to test for by default (invoke {@link Continuum#getSupportedStandards} for a list of these).
	 * Set the value of the 'defaultStandardIds' attribute in continuum.conf.js to null to not filter by any accessibility standards by default.
	 *
	 * @returns {?number[]}
	 */
	static getDefaultStandardIds() {
		return Configuration.INSTANCE.defaultStandardIds;
	}

	/**
	 * Gets the value for the 'includePotentialAccessibilityConcerns' attribute defined in continuum.conf.js.
	 * Used to determine whether or not accessibility concerns that require manual review are returned in any of Continuum's test results.
	 * If enabled, any accessibility concerns that require manual review will have {@link AccessibilityConcern#needsReview} return true.
	 * This setting can be toggled programmatically using {@link Continuum#setIncludePotentialAccessibilityConcerns}, overriding this value specified in continuum.conf.js.
	 *
     * @deprecated Please use {@link Configuration.AccessibilityConcernsConfiguration#getIncludePotentialConcerns()} instead
     *
	 * @returns {boolean}
	 */
	static getIncludePotentialAccessibilityConcerns() {
		return Configuration.INSTANCE.includePotentialAccessibilityConcerns;
	}

	/**
	 * Gets the value for the 'ampApiToken' attribute defined in continuum.conf.js.
	 * The AMP API token of the user to use to authenticate any requests to AMP that require authentication, e.g. creating/editing reports in AMP from Continuum as part of submitting test results from Continuum to AMP.
	 * Set to null if you don't want to take advantage of this functionality.
	 *
	 * @returns {?string}
	 */
	static getAmpApiToken() {
		return Configuration.INSTANCE.ampApiToken;
	}

	/**
	 * Gets the proxy-specific configuration in Continuum represented by the 'proxy' object defined in continuum.conf.js.
	 *
	 * @returns {Configuration.Proxy}
	 */
	static getProxyConfiguration() {
		return Configuration.INSTANCE.proxyConfiguration;
	}

	/**
	 * Gets the Elevin-specific configuration in Continuum represented by the 'elevin' object defined in continuum.conf.js.
	 *
	 * @returns {Configuration.ElevinConfiguration}
	 */
	static getElevinConfiguration() {
		return Configuration.INSTANCE.elevinConfiguration;
	}

	static getAccessibilityConcernsConfiguration() {
		return Configuration.INSTANCE.accessibilityConcerns;
	}
}

/**
 * This class encapsulates all proxy-specific configuration in Continuum represented by the 'proxy' object defined in the user-editable continuum.conf.js file.
 *
 * @hideconstructor
 */
Configuration.Proxy = class Proxy {
	/**
	 * Gets the value for the 'host' attribute of the the 'proxy' object defined in continuum.conf.js.
	 * The IP address or hostname of the desired proxy to route all network traffic from Continuum through.
	 * Set to null if you don't want to use a proxy.
	 *
	 * @returns {?string}
	 */
	getHost() {
		return Configuration.INSTANCE.proxyConfiguration.host;
	}

	/**
	 * Gets the value for the 'port' attribute of the the 'proxy' object defined in continuum.conf.js.
	 * The port of the desired proxy to route all network traffic from Continuum through.
	 * Set to null if you don't want to use a proxy.
	 *
	 * @returns {?number}
	 */
	getPort() {
		return Configuration.INSTANCE.proxyConfiguration.port;
	}

	/**
	 * Gets the value for the 'username' attribute of the the 'proxy' object defined in continuum.conf.js.
	 * The username for the desired proxy to route all network traffic from Continuum through.
	 * Set to null if your proxy does not require a username, or if you don't want to use a proxy.
	 *
	 * @returns {?string}
	 */
	getUsername() {
		return Configuration.INSTANCE.proxyConfiguration.username;
	}

	/**
	 * Gets the value for the 'password' attribute of the 'proxy' object defined in continuum.conf.js.
	 * The password for the desired proxy to route all network traffic from Continuum through.
	 * Set to null if your proxy does not require a password, or if you don't want to use a proxy.
	 *
	 * @returns {?string}
	 */
	getPassword() {
		return Configuration.INSTANCE.proxyConfiguration.password;
	}
};


/**
 * This encapsulates all of Elevin-specific properties required for integration
 *
 * @hideconstructor
 * */
Configuration.ElevinConfiguration = class ElevinConfiguration {
	/**
	* This is the API key used in requests to Elevin services
	*
	* @returns {?string}
	*/
	getApiKey() {
		return Configuration.INSTANCE.elevinConfiguration.apiKey;
	}

	/**
	* This is the base URL where Elevin services are located
	*
	* @returns {?string}
	*/
	getBaseUrl() {
		return Configuration.INSTANCE.elevinConfiguration.baseUrl;
	}
}

/**
 * Configuration properties relating to accessibility concerns
 *
 * @hideconstructor
 */
Configuration.AccessibilityConcernsConfiguration = class AccessibilityConcernsConfiguration {
	/**
	* Gets the value for the 'includePotentialAccessibilityConcerns' attribute defined in continuum.json.
	* Used to determine whether or not accessibility concerns that require manual review are returned in any of Continuum's test results.
	* If enabled, any accessibility concerns that require manual review will have {@link AccessibilityConcern#getNeedsReview} return true.
	* This setting can be toggled programmatically using {@link Continuum#setIncludePotentialAccessibilityConcerns(boolean)}, overriding this value specified in continuum.json.
	*
	* @returns {boolean}
	*/
	getIncludePotentialConcerns() {
		return Configuration.INSTANCE.accessibilityConcerns.includePotentialConcerns;
	}

	/**
	* Determines the format of the test results being generated where explicit
	* calls to SDK methods don't return a specific type.
	*
	* @returns {?string}
	*/

	getFormat() {
		return Configuration.INSTANCE.accessibilityConcerns.format;
	}
}

/**
 * This class represents an accessibility concern identified by Access Engine.
 * At minimum, it contains both information about the concern that was identified and well as where on the page the problem is located.
 * It may also include best practice data from AMP, e.g. how severe or noticeable the issue might be, along with an AMP URL that can be visited for more info.
 */
class AccessibilityConcern {

	/**
	 * @constructor
	 * @param {string} path - a CSS selector to the element with this accessibility concern
	 * @param {number} engineTestId - the automatic Access Engine test ID that failed and produced this accessibility concern
	 * @param {string} attribute - a brief human-readable description of this accessibility concern
	 * @param {number} bestPracticeId - the best practice ID that corresponds to this accessibility concern
	 * @param {string} element - the source code of the HTML node corresponding to this accessibility concern
	 * @param {FixType} fixType - the remediation steps suggested by Access Engine for resolving this accessibility concern
	 * @param {boolean} needsReview - whether or not this accessibility concern requires manual review
	 * @param {object} rawEngineJsonObject - the raw JSON object from Access Engine that was originally used to build this accessibility concern
	 * @param {string} bestPracticeDescription - the name of the best practice that corresponds to this accessibility concern
	 * @param {number} severity - the severity of the best practice that corresponds to this accessibility concern
	 * @param {number} noticeability - the noticeability of the best practice that corresponds to this accessibility concern
	 * @param {number} tractability - the tractability of the best practice that corresponds to this accessibility concern
	 * @param {string} bestPracticeDetailsUrl - the URL of the best practice page in AMP that corresponds to this accessibility concern
	 * @param {Standard[]} bestPracticeStandards - the array of accessibility standards associated with the best practice that corresponds to this accessibility concern
	 * @returns {AccessibilityConcern}
	 */
	constructor(path, engineTestId, attribute, bestPracticeId, element, fixType, needsReview, rawEngineJsonObject, bestPracticeDescription, severity, noticeability, tractability, bestPracticeDetailsUrl, bestPracticeStandards) {
		this._path = path;
		this._engineTestId = engineTestId;
		this._attribute = attribute;
		this._bestPracticeId = bestPracticeId;
		this._element = element;
		this._fixType = (fixType != null && (fixType.domSpec != null || fixType.helperText != null)) ? new FixType(fixType.domSpec, fixType.helperText) : null;

		// enriched data from Continuum (that may be derived from Engine)
		this._needsReview = needsReview;
		this._rawEngineJsonObject = rawEngineJsonObject;

		// optional: enriched best practice data from AMP
		this._bestPracticeDescription = bestPracticeDescription || null;
		this._severity = severity || null;
		this._noticeability = noticeability || null;
		this._tractability = tractability || null;
		this._bestPracticeDetailsUrl = bestPracticeDetailsUrl || null;
		this._bestPracticeStandards = bestPracticeStandards || null;

		this.toJSON = function() {
			const result = {};
			for (let x in this) {
				// exclude member variables that shouldn't be exposed for readability purposes
				if (x !== "_rawEngineJsonObject") {
					result[x] = this[x];
				}
			}
			return result;
		};
	}

	/**
	 * A CSS (for web) or XPath (for mobile) selector to the element with this accessibility concern.
	 *
	 * @returns {string} a CSS selector to the element with this accessibility concern
	 */
	get path() {
		return this._path;
	}

	set path(path) {
		this._path = path;
	}

	/**
	 * The automatic Access Engine test ID that failed and produced this accessibility concern.
	 * Visit the URL returned by {@link AccessibilityConcern#bestPracticeDetailsUrl} for more information.
	 *
	 * @returns {number} the automatic Access Engine test ID that failed and produced this accessibility concern
	 */
	get engineTestId() {
		return this._engineTestId;
	}

	set engineTestId(engineTestId) {
		this._engineTestId = engineTestId;
	}

	/**
	 * A brief human-readable description of this accessibility concern.
	 * Visit the URL returned by {@link AccessibilityConcern#bestPracticeDetailsUrl} for more information.
	 *
	 * @returns {string} a brief human-readable description of this accessibility concern
	 */
	get attribute() {
		return this._attribute;
	}

	set attribute(attribute) {
		this._attribute = attribute;
	}

	/**
	 * The best practice ID that corresponds to this accessibility concern.
	 * Visit the URL returned by {@link AccessibilityConcern#bestPracticeDetailsUrl} for more information.
	 *
	 * @returns {number} the best practice ID that corresponds to this accessibility concern
	 */
	get bestPracticeId() {
		return this._bestPracticeId;
	}

	set bestPracticeId(bestPracticeId) {
		this._bestPracticeId = bestPracticeId;
	}

	/**
	 * The source code of the HTML node corresponding to this accessibility concern.
	 *
	 * @returns {string} the source code of the HTML node corresponding to this accessibility concern
	 */
	get element() {
		return this._element;
	}

	set element(element) {
		this._element = element;
	}

	/**
	 * The remediation steps suggested by Access Engine for resolving this accessibility concern.
	 *
	 * @returns {FixType} the remediation steps suggested by Access Engine for resolving this accessibility concern
	 */
	get fixType() {
		return this._fixType;
	}

	set fixType(fixType) {
		this._fixType = fixType;
	}

	/**
	 * Gets whether or not this accessibility concern requires manual review, i.e. whether the user should manually use AMP to determine whether or not this accessibility concern is actually a legitimate violation given the context of the offending element ({@link AccessibilityConcern#element}).
	 * If this returns true, visit the URL returned by {@link AccessibilityConcern#bestPracticeDetailsUrl} for more information on how to manually validate the applicability of this accessibility concern relative to the offending element ({@link AccessibilityConcern#element}); it may be that this accessibility concern is not applicable given this context.
	 * Accessibility concerns that require manual review will only ever be returned (and thus this function will only ever possibly return false for a given accessibility concern) if {@link Continuum#includePotentialAccessibilityConcerns} returns true.
	 *
	 * @returns {boolean} whether or not this accessibility concern requires manual review
	 */
	get needsReview() {
		return this._needsReview;
	}

	set needsReview(needsReview) {
		this._needsReview = needsReview;
	}

	/**
	 * The raw JSON object from Access Engine that was originally used to build this accessibility concern.
	 *
	 * @returns {object} the raw JSON object from Access Engine that was originally used to build this accessibility concern
	 */
	get rawEngineJsonObject() {
		return this._rawEngineJsonObject;
	}

	set rawEngineJsonObject(rawEngineJsonObject) {
		this._rawEngineJsonObject = rawEngineJsonObject;
	}

	/**
	 * The name of the best practice that corresponds to this accessibility concern.
	 * Visit the URL returned by {@link AccessibilityConcern#bestPracticeDetailsUrl} for more information.
	 *
	 * @returns {string} the name of the best practice that corresponds to this accessibility concern
	 */
	get bestPracticeDescription() {
		return this._bestPracticeDescription;
	}

	set bestPracticeDescription(bestPracticeDescription) {
		this._bestPracticeDescription = bestPracticeDescription;
	}

	/**
	 * The severity of this accessibility concern on a scale of 1 to 10, where 1 is the least severe and 10 is the most severe.
	 * Visit the URL returned by {@link AccessibilityConcern#bestPracticeDetailsUrl} for more information.
	 *
	 * @returns {number} the severity of the best practice that corresponds to this accessibility concern
	 */
	get severity() {
		return this._severity;
	}

	set severity(severity) {
		this._severity = severity;
	}

	/**
	 * The noticeability of this accessibility concern on a scale of 1 to 10, where 1 is the least noticeable and 10 is the most noticeable.
	 * Visit the URL returned by {@link AccessibilityConcern#bestPracticeDetailsUrl} for more information.
	 *
	 * @returns {number} the noticeability of the best practice that corresponds to this accessibility concern
	 */
	get noticeability() {
		return this._noticeability;
	}

	set noticeability(noticeability) {
		this._noticeability = noticeability;
	}

	/**
	 * The tractability of this accessibility concern on a scale of 1 to 10, where 1 is the least tractable and 10 is the most tractable.
	 * Visit the URL returned by {@link AccessibilityConcern#bestPracticeDetailsUrl} for more information.
	 *
	 * @returns {number} the tractability of the best practice that corresponds to this accessibility concern
	 */
	get tractability() {
		return this._tractability;
	}

	set tractability(tractability) {
		this._tractability = tractability;
	}

	/**
	 * The URL of the best practice page in AMP that corresponds to this accessibility concern.
	 * An AMP license is not required to visit this URL, but if you're logged into AMP, you'll be presented with additional information beyond what's publicly available.
	 *
	 * @returns {string} the URL of the best practice page in AMP that corresponds to this accessibility concern
	 */
	get bestPracticeDetailsUrl() {
		return this._bestPracticeDetailsUrl;
	}

	set bestPracticeDetailsUrl(bestPracticeDetailsUrl) {
		this._bestPracticeDetailsUrl = bestPracticeDetailsUrl;
	}

	/**
	 * An array of accessibility standards associated with the best practice that corresponds to this accessibility concern, ordered alphabetically by name.
	 * Visit the URL returned by {@link AccessibilityConcern#bestPracticeDetailsUrl} for more information.
	 *
	 * @returns {Standard[]} an array of accessibility standards associated with the best practice that corresponds to this accessibility concern
	 */
	get bestPracticeStandards() {
		return this._bestPracticeStandards;
	}

	set bestPracticeStandards(bestPracticeStandards) {
		this._bestPracticeStandards = bestPracticeStandards;
	}
}

/**
 * A class that encapsulates remediation steps suggested by Access Engine for resolving an accessibility concern.
 */
class FixType {

	/**
	 * @constructor
	 * @param {boolean} domSpec - defines whether this fix is specific to the particular page under test
	 * @param {string} helperText - a brief human-readable description of how to resolve the accessibility concern corresponding to this fix
	 * @returns {FixType}
	 */
	constructor(domSpec, helperText) {
		this._domSpec = domSpec;
		this._helperText = helperText;
	}

	set domSpec(domSpec) {
		this._domSpec = domSpec;
	}

	/**
	 * Defines whether this fix is specific to the particular page under test.
	 *
	 * @returns {boolean} whether this fix is specific to the particular page under test, or more general
	 */
	get domSpec() {
		return this._domSpec;
	}

	set helperText(helperText) {
		this._helperText = helperText;
	}

	/**
	 * A brief human-readable description of how to resolve the accessibility concern corresponding to this fix. Consult AMP for additional information.
	 *
	 * @returns {string} a brief human-readable description of how to resolve the accessibility concern corresponding to this fix
	 */
	get helperText() {
		return this._helperText;
	}
}

/**
 * A class that encapsulates accessibility standards associated with best practices returned by AMP.
 */
class Standard {

	/**
	 * @constructor
	 * @param {number} id - the ID of the accessibility standard
	 * @param {string} name - the name of the accessibility standard
	 * @returns {Standard}
	 */
	constructor(id, name) {
		this._id = id;
		this._name = name;
	}

	set id(id) {
		this._id = id;
	}

	/**
	 * Gets the ID of the accessibility standard as defined in AMP.
	 *
	 * @returns {number} the ID of the accessibility standard
	 */
	get id() {
		return this._id;
	}

	set name(name) {
		this._name = name;
	}

	/**
	 * Gets the name of the accessibility standard as defined in AMP.
	 *
	 * @returns {string} the name of the accessibility standard
	 */
	get name() {
		return this._name;
	}
}

/**
 * This class encapsulates all network requests Continuum itself makes to the Internet.
 *
 * @private
 */
class NetworkUtil {

	static getFromAMP(urlEndpointPath, queryParams, includeToken, driver, windowUnderTest) {
		return NetworkUtil._getFromAMP('GET', urlEndpointPath, queryParams, null, includeToken, driver, windowUnderTest);
	}

	static postToAMP(urlEndpointPath, bodyParams, includeToken, driver, windowUnderTest) {
		return NetworkUtil._getFromAMP('POST', urlEndpointPath, null, bodyParams, includeToken, driver, windowUnderTest);
	}

	/**
	 * Sends a message to Elevin at the endpoint specified by url using the HTTP method specified by method. If a payload
	 * argument is non-null, it will be converted to a gzip-compressed base64 string and used as the request body.
	 *
	 * If the response received back from Elevin indicates success (e.g. a 200 response code) then the response body will
	 * be converted from a JSON string to an object which is returned from the method. If the response body is
	 * empty though, null will be returned.
	 *
	 * @param method
	 * @param url
	 * @param payload
	 * @param driver
	 * @param windowUnderTest
	 * @return The object representation of the JSON content of the response body. Null if the response body is empty.
	 * @throws HttpErrorException
	 */
	static async sendToElevin({ method, url, payload, driver, windowUnderTest }) {
		try {
			return await NetworkUtil._sendToElevin({
				method,
				url,
				payload,
				driver,
				windowUnderTest
			});
		} catch (e) {
			console.log(e);
		}

	}

	static async _handleProxy({ callback }) {
		let credentials = "";
		if (Configuration.getProxyConfiguration().getUsername()) {
			credentials = `${Configuration.getProxyConfiguration().getUsername()}:${Configuration.getProxyConfiguration().getPassword()}@`;
		}

		// enable the proxy, perform our network request, then disable the proxy
		require('global-agent/bootstrap');
		global.GLOBAL_AGENT.HTTP_PROXY = `http://${credentials}${Configuration.getProxyConfiguration().getHost()}:${Configuration.getProxyConfiguration().getPort()}`;
		try {
			if (callback.constructor.name === 'AsyncFunction') {
				return await callback();
			} else {
				return callback();
			}
		} finally {
			global.GLOBAL_AGENT.HTTP_PROXY = '';
		}
	}

	static async _sendServerRequest({ url, method, headers, payload }) {
		const body = await NetworkUtil._convertToGzip(payload);

		const axios = require("axios");
		try {
			const { data } = await axios({
				method,
				url,
				data: body,
				headers
			});

			return data;
		} catch (e) {
			throw new HttpErrorException(`Something went wrong while sending ${method} request to ${url}`);
		}
	}

	static async _sendClientRequest({ method, url, headers, payload }) {
		const processedPayload = await NetworkUtil._convertToGzip(payload);

		return new Promise((resolve, reject) => {
			const request = new XMLHttpRequest();
			request.open(method, url, true);
			headers.forEach(header => {
				request.setRequestHeader(header.key, header.value);
			});
			request.timeout = NetworkUtil._getTimeout();
			request.onload = () => {
				if (request.readyState === 4) {
					if (request.status === 200) {
						resolve(request.responseText ? JSON.parse(request.responseText) : null);
					} else {
						throw new HttpErrorException(`Unexpectedly encountered a non-200 status code (${request.status} ${request.statusText}) while attempting to ${method} data from ${url}`);
					}
				}
			};
			request.onerror = (err) => {
				reject(err);
			};
			request.send(processedPayload);
		});
	}

	static _getFromAMP(method, urlEndpointPath, queryParams, bodyParams, includeToken, driver, windowUnderTest) {
		if (includeToken) {
			if (!queryParams) {
				queryParams = {}
			}
			queryParams.apiToken = Configuration.getAmpApiToken();
		}

		if (!urlEndpointPath) {
			urlEndpointPath = "";
		}
		const url = Configuration.getAmpInstanceUrl() + urlEndpointPath + NetworkUtil._formatQueryParams(queryParams);

		if (driver) {
			return new Promise((resolve, reject) => {
				const ampInstanceUrlWithoutProtocol = Configuration.getAmpInstanceUrl().replace(/https?:\/\//, "");

				const sendAMPRequest = (socket) => {
					const options = {
						host: ampInstanceUrlWithoutProtocol,
						port: 443,
						method: method,
						path: urlEndpointPath + NetworkUtil._formatQueryParams(queryParams),
						headers: {
							'Content-Type': 'application/json;charset=UTF-8'
						},
					};

					if (socket) {
						options.socket = socket;
						options.agent = false;
					}

					const req = require('https').request(options, (res) => {
						if (res.statusCode !== 200) {
							throw new HttpErrorException(`Unexpectedly encountered a non-200 status code (${res.statusCode} ${res.statusMessage}) while attempting to GET data from ${url}`);
						}

						res.setEncoding('utf8');
						let output = '';

						res.on('data', (chunk) => {
							output += chunk;
						});

						res.on('end', () => {
							resolve(output ? JSON.parse(output) : null);
						});
					});

					req.on('socket', (socket) => {
						socket.setTimeout(NetworkUtil._getTimeout());
						socket.on('timeout', () => {
							req.abort();
						});
					});

					req.on('error', (err) => {
						reject(err);
					});

					if (method === 'POST') {
						req.write(NetworkUtil._formatBodyParams(bodyParams));
					}

					req.end();
				};

				if (Configuration.getProxyConfiguration() && Configuration.getProxyConfiguration().getHost()) {
					NetworkUtil._handleProxy({ callback: sendAMPRequest });
				} else {
					sendAMPRequest();
				}
			});
		} else if (windowUnderTest) {
			return new Promise((resolve, reject) => {
				const request = new XMLHttpRequest();

				request.open(method, url, true);
				request.setRequestHeader('Content-Type', "application/json;charset=UTF-8");
				request.timeout = NetworkUtil._getTimeout();
				request.onload = () => {
					if (request.readyState === 4) {
						if (request.status === 200) {
							resolve(request.responseText ? JSON.parse(request.responseText) : null);
						} else {
							throw new HttpErrorException(`Unexpectedly encountered a non-200 status code (${request.status} ${request.statusText}) while attempting to GET data from ${url}`);
						}
					}
				};
				request.onerror = (err) => {
					reject(err);
				};
				request.send(bodyParams ? NetworkUtil._formatBodyParams(bodyParams) : null);
			});
		}
	}

	static async _sendToElevin({ method, url, payload, driver, windowUnderTest }) {
		let urlString = Configuration.getElevinConfiguration().getBaseUrl() + url;

		if (driver) {
			const sendElevinRequest = async () => {
				return await NetworkUtil._sendServerRequest({
					url: urlString,
					method,
					payload,
					headers: {
						'Content-Type': 'application/json; charset=UTF-8',
						'X-Api-Key': Configuration.getElevinConfiguration().getApiKey()
					}
				});
			};

			if (Configuration.getProxyConfiguration() && Configuration.getProxyConfiguration().getHost()) {
				return NetworkUtil._handleProxy({ callback: sendElevinRequest });
			} else {
				return await sendElevinRequest();
			}
		} else if (windowUnderTest) {
			const headers = [{
				key: "Content-Type",
				value: "application/json;charset=UTF-8"
			},
			{
				key: "X-Api-Key",
				value: Configuration.getElevinConfiguration().getApiKey()
			}];

			return await NetworkUtil._sendClientRequest({
				method,
				url: urlString,
				headers,
				payload
			});
		}
	}

    static _getTimeout() {
		return 60000;  // in milliseconds
	}

	static _formatQueryParams(queryParams) {
		if (!queryParams || Object.keys(queryParams).length <= 0) {
			return "";
		}

		return "?" + Object.keys(queryParams).map((key) => {
			return [key, queryParams[key]].map(encodeURIComponent).join("=");
		}).join("&");
	}

	static _formatBodyParams(bodyParams) {
		if (!bodyParams || Object.keys(bodyParams).length <= 0) {
			return null;
		}

		return JSON.stringify(bodyParams);
	}

	static async _convertToGzip(payload) {
		if (!payload) {
			return payload;
		}

		if (typeof require !== 'undefined') {
			const zlib = require("zlib");
			const util = require("util");
			const gzip = util.promisify(zlib.gzip);
			const compressedPayload = await gzip(JSON.stringify(payload));
			return compressedPayload.toString('base64');
		} else {
			const compressedPayload = window.pako.gzip(JSON.stringify(payload), { to: 'string' });
			return btoa(compressedPayload); // base64 encoding
		}
	}
}

/**
 * This class encapsulates all of functionality for submitting accessibility concerns identified using Continuum to AMP.
 *
 * Reporting test results from Continuum to AMP is accomplished through a kind of state machine, where you set the active AMP instance, organization, asset, report, and module to use; once these are set, they remain set for as long as they're not set again and for as long as Continuum is initialized.
 * Depending on the report and module management strategies you decide to use—see {@link ReportManagementStrategy} and {@link ModuleManagementStrategy}, respectively—invoking {@link AMPReportingService#submitAccessibilityConcernsToAMP} will first create, overwrite, and/or delete reports and modules from AMP, then publish your test results to the active AMP module.
 * You can set the active report and module management strategies using {@link AMPReportingService#setActiveReportManagementStrategy} and {@link AMPReportingService#setActiveModuleManagementStrategy}, respectively.
 * Only once all of these active items are set should you invoke {@link AMPReportingService#submitAccessibilityConcernsToAMP} using the list of accessibility concerns you'd like to report.
 *
 * More on report and module management strategies: they are designed with two primary use cases in mind: continuous integration (CI) workflows (where you usually want to retain the results of previously published reports), and more manual workflows (e.g. when Continuum is run from a developer's local workstation, where you usually don't want to retain the results of previously published reports).
 * Choosing the correct report and module management strategies to meet your business objectives is critical to using Continuum's AMP reporting functionality correctly, so please consult our support documentation for more information.
 *
 * @hideconstructor
 */
class AMPReportingService {

	/**
	 * @constructor
	 * @returns {AMPReportingService}
	 */
	constructor(driver, windowUnderTest) {
		this._activeInstance = Configuration.getAmpInstanceUrl();
		this._activeOrganizationId = null;
		this._activeAssetId = null;
		this._activeReport = null;
		this._activeModule = null;
		this._activeReportManagementStrategy = null;
		this._activeModuleManagementStrategy = null;

		this._driver = driver;
		this._windowUnderTest = windowUnderTest;
	}

	/**
	 * @private
	 * @returns {string}
	 */
	get activeInstance() {
		return this._activeInstance;
	}

	set activeInstance(activeInstance) {
		this._activeInstance = activeInstance;
	}

	/**
	 * @private
	 * @returns {number}
	 */
	get activeOrganizationId() {
		return this._activeOrganizationId;
	}

	set activeOrganizationId(activeOrganizationId) {
		this._activeOrganizationId = activeOrganizationId;
	}

	/**
	 * @private
	 * @returns {number}
	 */
	get activeAssetId() {
		return this._activeAssetId;
	}

	set activeAssetId(activeAssetId) {
		this._activeAssetId = activeAssetId;
	}

	/**
	 * @private
	 * @returns {boolean}
	 */
	get suppressSensitiveData() {
		return this._suppressSensitiveData;
	}

	set suppressSensitiveData(suppressSensitiveData) {
		this._suppressSensitiveData = suppressSensitiveData;
	}

	/**
	 * Gets the active report.
	 * This is null if {@link setActiveReportById} or {@link setActiveReportByName} hasn't been invoked to set an active report yet.
	 * Use this to access the active report's metadata, e.g. its ID in AMP, its name, etc.
	 *
	 * @see Report
	 * @returns {?Report}
	 */
	get activeReport() {
		return this._activeReport;
	}

	/**
	 * @private
	 * @param activeReport
	 */
	set activeReport(activeReport) {
		this._activeReport = activeReport;
	}

	/**
	 * Gets the active module.
	 * This is null if {@link setActiveModuleById} or {@link setActiveModuleByName} hasn't been invoked to set an active module yet.
	 * Use this to access the active module's metadata, e.g. its ID in AMP, its name, etc.
	 *
	 * @see Module
	 * @returns {?Module}
	 */
	get activeModule() {
		return this._activeModule;
	}

	/**
	 * @private
	 * @param activeModule
	 */
	set activeModule(activeModule) {
		this._activeModule = activeModule;
	}

	/**
	 * @private
	 * @returns {ReportManagementStrategy}
	 */
	get activeReportManagementStrategy() {
		return this._activeReportManagementStrategy;
	}

	set activeReportManagementStrategy(activeReportManagementStrategy) {
		this._activeReportManagementStrategy = activeReportManagementStrategy;
	}

	/**
	 * @private
	 * @returns {ModuleManagementStrategy}
	 */
	get activeModuleManagementStrategy() {
		return this._activeModuleManagementStrategy;
	}

	set activeModuleManagementStrategy(activeModuleManagementStrategy) {
		this._activeModuleManagementStrategy = activeModuleManagementStrategy;
	}

	/**
	 * @private
	 * @returns {*}
	 */
	get driver() {
		return this._driver;
	}

	set driver(driver) {
		this._driver = driver;
	}

	/**
	 * @private
	 * @returns {Window}
	 */
	get windowUnderTest() {
		return this._windowUnderTest;
	}

	set windowUnderTest(window) {
		this._windowUnderTest = window;
	}

	/**
	 * Validates the specified ID of an existing organization in AMP, then sets it as the active organization in Continuum such that next time {@link AMPReportingService#submitAccessibilityConcernsToAMP} is invoked, test results will be submitted to this active organization.
	 *
	 * @param {number} organizationId - the ID of the AMP organization to make active
	 * @throws {IllegalArgumentException} if the specified organization ID is null
	 * @throws {HttpErrorException} if an error is encountered while attempting to connect to AMP to validate the specified organization ID
	 * @throws {NotFoundException} if the specified organization may not exist in the active AMP instance or is otherwise not accessible
	 */
	async setActiveOrganization(organizationId) {
		if (!organizationId) {
			throw new IllegalArgumentException("Active organization cannot be null");
		}

		const responseJson = await NetworkUtil.getFromAMP("/api/cont/organization/validate", {
			organizationId: organizationId.toString()
		}, true, this.driver, this.windowUnderTest);

		if (!responseJson.valid) {
			const message = responseJson.message ? ("; " + responseJson.message) : "";
			throw new NotFoundException(`Organization with ID '${organizationId}' not found in active AMP instance '${this.activeInstance}'${message}`);
		}

		this.activeOrganizationId = organizationId;
	}

	/**
	 * Validates the specified ID of an existing asset in AMP, then sets it as the active asset in Continuum such that next time {@link AMPReportingService#submitAccessibilityConcernsToAMP} is invoked, test results will be submitted to this active asset.
	 * Make sure you first set the active organization for this asset prior to invoking this function using {@link AMPReportingService#setActiveOrganization}.
	 *
	 * @param {number} assetId - the ID of the AMP asset to make active
	 * @throws {IllegalStateException} if the active organization is not set
	 * @throws {IllegalArgumentException} if the specified asset ID is null
	 * @throws {HttpErrorException} if an error is encountered while attempting to connect to AMP to validate the specified asset ID
	 * @throws {NotFoundException} if the specified asset may not exist in the active AMP instance or is otherwise not accessible
	 */
	async setActiveAsset(assetId) {
		if (!this.activeOrganizationId) {
			throw new IllegalStateException("Active organization has not been set");
		}

		if (!assetId) {
			throw new IllegalArgumentException("Active asset cannot be null");
		}

		const responseJson = await NetworkUtil.getFromAMP("/api/cont/asset/validate", {
			assetId: assetId.toString()
		}, true, this.driver, this.windowUnderTest);

		if (!responseJson.valid) {
			const message = responseJson.message ? ("; " + responseJson.message) : "";
			throw new NotFoundException(`Asset with ID '${assetId}' not found in active AMP instance '${this.activeInstance}'${message}`);
		}

		this.activeAssetId = assetId;
		this.suppressSensitiveData = (responseJson.suppressSensitiveData != null) ? responseJson.suppressSensitiveData : false;
	}

	/**
	 * Validates the specified ID of an existing report in AMP, then sets it as the active report in Continuum such that next time {@link AMPReportingService#submitAccessibilityConcernsToAMP} is invoked, test results will be submitted to this active report.
	 * Make sure you first set the active organization and asset for this report prior to invoking this function using {@link AMPReportingService#setActiveOrganization} and {@link AMPReportingService#setActiveAsset}, respectively.
	 *
	 * @param {number} reportId - the ID of the AMP report to make active
	 * @throws {IllegalStateException} if the active organization or asset is not set
	 * @throws {IllegalArgumentException} if the specified report ID is null
	 * @throws {HttpErrorException} if an error is encountered while attempting to connect to AMP to validate the specified report ID
	 * @throws {NotFoundException} if the specified report may not exist in the active AMP instance or is otherwise not accessible
	 */
	async setActiveReportById(reportId) {
		if (!this.activeOrganizationId) {
			throw new IllegalStateException("Active organization has not been set");
		}

		if (!this.activeAssetId) {
			throw new IllegalStateException("Active asset has not been set");
		}

		if (!reportId) {
			throw new IllegalArgumentException("Active report cannot be null");
		}

		let reportName = null;

		const responseJson = await NetworkUtil.getFromAMP("/api/cont/report/validate", {
			assetId: this.activeAssetId.toString(),
			reportId: reportId.toString()
		}, true, this.driver, this.windowUnderTest);

		if (!responseJson.valid) {
			const message = responseJson.message ? ("; " + responseJson.message) : "";
			throw new NotFoundException(`Report with ID '${reportId}' not found in active AMP instance '${this.activeInstance}'${message}`);
		}

		reportName = responseJson.reportName;

		this.activeReport = new Report(reportId, reportName);
	}

	/**
	 * Sets the active report in AMP to submit test results to next time {@link AMPReportingService#submitAccessibilityConcernsToAMP} is invoked.
	 * The report name specified is validated, but unlike {@link AMPReportingService#setActiveReportById}, this method will not throw an exception if the specified report does not yet exist in AMP; it will be created next time {@link AMPReportingService#submitAccessibilityConcernsToAMP} is invoked.
	 * Make sure you first set the active organization and asset for this report prior to invoking this function using {@link AMPReportingService#setActiveOrganization} and {@link AMPReportingService#setActiveAsset}, respectively.
	 *
	 * @param {string} reportName - the name of the AMP report to make active
	 * @throws {IllegalStateException} if the active organization or asset is not set
	 * @throws {IllegalArgumentException} if the specified report name is null
	 * @throws {HttpErrorException} if an error is encountered while attempting to connect to AMP to validate the specified report name
	 * @returns {number} the ID of the AMP report, if it already exists; null if the report does not yet exist in AMP
	 */
	async setActiveReportByName(reportName) {
		if (!this.activeOrganizationId) {
			throw new IllegalStateException("Active organization has not been set");
		}

		if (!this.activeAssetId) {
			throw new IllegalStateException("Active asset has not been set");
		}

		if (!reportName) {
			throw new IllegalArgumentException("Active report cannot be null");
		}

		let reportId = null;

		const responseJson = await NetworkUtil.getFromAMP("/api/cont/report/validate", {
			assetId: this.activeAssetId.toString(),
			reportName: reportName
		}, true, this.driver, this.windowUnderTest);

		if (responseJson.valid && responseJson.reportId) {
			reportId = responseJson.reportId;
		}

		this.activeReport = new Report(reportId, reportName);
		return reportId;
	}

	/**
	 * Validates the specified ID of an existing module in AMP, then sets it as the active module in Continuum such that next time {@link AMPReportingService#submitAccessibilityConcernsToAMP} is invoked, test results will be submitted to this active module.
	 * Make sure you first set the active organization, asset, and report for this module prior to invoking this function using {@link AMPReportingService#setActiveOrganization}, {@link AMPReportingService#setActiveAsset}, and {@link AMPReportingService#setActiveReportById} or {@link AMPReportingService#setActiveReportByName}, respectively.
	 * While using {@link ReportManagementStrategy#OVERWRITE} as your report management strategy, use {@link AMPReportingService#setActiveModuleByName} instead of this method; see the documentation for {@link ReportManagementStrategy#OVERWRITE} for details as to why.
	 *
	 * @param {number} moduleId - the ID of the AMP module to make active
	 * @throws {IllegalStateException} if the active organization, asset, or report is not set
	 * @throws {IllegalArgumentException} if the specified module ID is null
	 * @throws {HttpErrorException} if an error is encountered while attempting to connect to AMP to validate the specified module ID
	 * @throws {NotFoundException} if the specified module may not exist in the active AMP report
	 */
	async setActiveModuleById(moduleId) {
		if (!this.activeOrganizationId) {
			throw new IllegalStateException("Active organization has not been set");
		}

		if (!this.activeAssetId) {
			throw new IllegalStateException("Active asset has not been set");
		}

		if (!this.activeReport || !this.activeReport.id) {
			throw new IllegalStateException("Active report has not been set");
		}

		if (!moduleId) {
			throw new IllegalArgumentException("Active module cannot be null");
		}

		let moduleName = null;
		let moduleLocation = null;

		const responseJson = await NetworkUtil.getFromAMP("/api/cont/module/validate", {
			assetId: this.activeAssetId.toString(),
			reportId: this.activeReport.id.toString(),
			moduleId: moduleId.toString()
		}, true, this.driver, this.windowUnderTest);

		if (!responseJson.valid) {
			const message = responseJson.message ? ("; " + responseJson.message) : "";
			throw new NotFoundException(`Module with ID '${moduleId}' not found in active AMP instance '${this.activeInstance}'${message}`);
		}

		moduleName = responseJson.moduleName;
		moduleLocation = responseJson.moduleLocation;

		this.activeModule = new Module(moduleId, moduleName, moduleLocation);
	}

	/**
	 * Sets the active module in AMP to submit test results to next time {@link AMPReportingService#submitAccessibilityConcernsToAMP} is invoked.
	 * The module name specified is validated if the active report already exists in AMP, but unlike {@link AMPReportingService#setActiveModuleById}, this method will not throw an exception if the specified module does not yet exist in AMP; it will be created next time {@link AMPReportingService#submitAccessibilityConcernsToAMP} is invoked.
	 * Make sure you first set the active organization, asset, and report for this module prior to invoking this function using {@link AMPReportingService#setActiveOrganization}, {@link AMPReportingService#setActiveAsset}, and {@link AMPReportingService#setActiveReportById} or {@link AMPReportingService#setActiveReportByName}, respectively.
	 *
	 * @param {string} moduleName - the name of the AMP module to make active
	 * @param {string} moduleLocation - the name of the location in the website or app being tested; this can be a fully qualified URL, or simply a page title like "Login Page"
	 * @throws {IllegalStateException} if the active organization, asset, or report is not set
	 * @throws {IllegalArgumentException} if the specified module name or location is null
	 * @throws {HttpErrorException} if an error is encountered while attempting to connect to AMP to validate the specified module name
	 * @returns {number} the ID of the AMP module, if it already exists; null if the module does not yet exist in AMP
	 */
	async setActiveModuleByName(moduleName, moduleLocation) {
		if (!this.activeOrganizationId) {
			throw new IllegalStateException("Active organization has not been set");
		}

		if (!this.activeAssetId) {
			throw new IllegalStateException("Active asset has not been set");
		}

		if (!this.activeReport) {
			throw new IllegalStateException("Active report has not been set");
		}

		if (!moduleName) {
			throw new IllegalArgumentException("Active module cannot be null");
		}

		if (!moduleLocation) {
			throw new IllegalArgumentException("Active module location cannot be null");
		}

		let moduleId = null;

		// only attempt to validate this module if we have the necessary report ID to do so
		if (this.activeReport.id) {
			const responseJson = await NetworkUtil.getFromAMP("/api/cont/module/validate", {
				assetId: this.activeAssetId.toString(),
				reportId: this.activeReport.id.toString(),
				moduleName: moduleName
			}, true, this.driver, this.windowUnderTest);

			if (responseJson.valid && responseJson.moduleId) {
				moduleId = responseJson.moduleId;
			}
		}

		this.activeModule = new Module(moduleId, moduleName, moduleLocation);
		return moduleId;
	}

	/**
	 * Sets the active report management strategy to use next time {@link AMPReportingService#submitAccessibilityConcernsToAMP} is invoked.
	 * Choosing the correct report and module management strategies to meet your business objectives is critical to using Continuum's AMP reporting functionality correctly, so please consult our support documentation for more information.
	 *
	 * @param {ReportManagementStrategy} reportManagementStrategy - the preferred management strategy to use when creating and editing AMP reports
	 */
	setActiveReportManagementStrategy(reportManagementStrategy) {
		this.activeReportManagementStrategy = reportManagementStrategy;
	}

	/**
	 * Sets the active module management strategy to use next time {@link AMPReportingService#submitAccessibilityConcernsToAMP} is invoked.
	 * Choosing the correct report and module management strategies to meet your business objectives is critical to using Continuum's AMP reporting functionality correctly, so please consult our support documentation for more information.
	 *
	 * @param {ModuleManagementStrategy} moduleManagementStrategy - the preferred management strategy to use when creating and editing AMP modules
	 */
	setActiveModuleManagementStrategy(moduleManagementStrategy) {
		this.activeModuleManagementStrategy = moduleManagementStrategy;
	}

	/**
	 * Submits accessibility concerns to the active AMP instance, organization, asset, report, and module.
	 * Make sure to set the active AMP organization (via {@link AMPReportingService#setActiveOrganization}), asset (via {@link AMPReportingService#setActiveAsset}), report (via {@link AMPReportingService#setActiveReportById} or {@link AMPReportingService#setActiveReportByName}), and module (via {@link AMPReportingService#setActiveModuleById} or {@link AMPReportingService#setActiveModuleByName}) prior to invoking this function.
	 * The active instance, organization, and asset must all already exist in AMP prior to invoking this function, otherwise an exception will be thrown; reports and modules don't need to exist in AMP yet, as they will be created if necessary.
	 * Also, make sure to set your desired report and module management strategies prior to invoking this function using {@link AMPReportingService#setActiveReportManagementStrategy} and {@link AMPReportingService#setActiveModuleManagementStrategy}, respectively, according to your use case.
	 * Choosing the correct report and module management strategies to meet your business objectives is critical to using Continuum's AMP reporting functionality correctly, so please consult our support documentation for more information.
	 *
	 * @param {AccessibilityConcern[]} accessibilityConcerns - the list of accessibility concerns to submit to AMP
	 * @throws {IllegalStateException} if the active instance, organization, asset, report, or module is not set
	 * @throws {HttpErrorException} if an error is encountered while attempting to connect to AMP to validate the active organization, asset, report, or module
	 * @throws {NotFoundException} if the active instance, organization, or asset may not exist in AMP as specified, or if an error occurs while attempting to create the necessary report or module in AMP (if applicable)
	 * @returns {boolean} true if uploading of the specified accessibility concerns to AMP succeeded; false if it did not
	 */
	async submitAccessibilityConcernsToAMP(accessibilityConcerns) {
		// validate active organization
		await this.setActiveOrganization(this.activeOrganizationId);

		// validate active asset
		await this.setActiveAsset(this.activeAssetId);

		// validate or create active report
		let reportExistsInAMP = false;
		if (this.activeReport && this.activeReport.id && this.activeReportManagementStrategy !== ReportManagementStrategy.UNIQUE) {
			// the active report already has an ID, so verify it still exists in AMP; if it doesn't, abort
			await this.setActiveReportById(this.activeReport.id);
			reportExistsInAMP = true;
		} else {
			// user has requested we guarantee the creation of a new report by modifying the report name they've specified
			if (this.activeReport && this.activeReport.name && this.activeReportManagementStrategy === ReportManagementStrategy.UNIQUE) {
				this.activeReport.name += ` (${new Date().toISOString()})`;
			}

			// the active report may or may not exist in AMP as no ID was specified, so check and create it if necessary
			const reportId = await this.setActiveReportByName(this.activeReport ? this.activeReport.name : null);
			if (!reportId) {
				this.activeReport.id = await this._createReport(this.activeReport.name);
				if (!this.activeReport.id) {
					throw new NotFoundException(`Could not create new report '${this.activeReport.name}' in AMP`);
				}

				if (this.activeModule) {
					// when the time comes, ensure a new module is created for this new report
					this.activeModule.id = null;
				}
			} else {
				this.activeReport.id = reportId;
				reportExistsInAMP = true;
			}
		}
		if (reportExistsInAMP) {
			if (this.activeReportManagementStrategy === ReportManagementStrategy.OVERWRITE) {
				const success = await this._deleteAllModulesInActiveReport();
				if (success) {
					// assuming the active module already existed in the active report when they were specified by the user, the active module's ID is no longer valid as this module was just deleted from AMP
					// clearing out the active module ID here means the active module will get recreated in AMP later on in the same active report as though the user had not specified an ID, which is what we want
					this.activeModule.id = null;
				} else {
					const reportIdentifierText = this.activeReport.name ? `'${this.activeReport.name}'` : `ID '${this.activeReport.id}'`;
					throw new NotFoundException(`Could not delete existing modules from report ${reportIdentifierText} in AMP`);
				}
			}
		}

		// validate or create active module
		let moduleExistsInAMP = false;
		let overwriteExistingAccessibilityConcerns = false;
		if (this.activeModule && this.activeModule.id) {
			// the active module already has an ID, so verify it still exists in AMP
			await this.setActiveModuleById(this.activeModule.id);
			moduleExistsInAMP = true;
		} else {
			// the active module may or may not exist in AMP as no ID was specified, so check and create it if necessary
			const moduleId = await this.setActiveModuleByName(this.activeModule ? this.activeModule.name : null, this.activeModule ? this.activeModule.location : null);
			if (!moduleId) {
				// module does not yet exist in AMP, so create it
				this.activeModule.id = await this._createModule(this.activeModule.name);
				if (!this.activeModule.id) {
					throw new NotFoundException(`Could not create new module '${this.activeModule.name}' in AMP`);
				}
			} else {
				this.activeModule.id = moduleId;
				moduleExistsInAMP = true;
			}
		}
		if (moduleExistsInAMP) {
			if (this.activeModuleManagementStrategy === ModuleManagementStrategy.ABORT) {
				console.log("The active module already exists in AMP! Aborting reporting to AMP per specified module management strategy of ABORT.");
				return false;
			} else if (this.activeModuleManagementStrategy === ModuleManagementStrategy.OVERWRITE) {
				overwriteExistingAccessibilityConcerns = true;
			}
		}

		// at this point, the active organization, asset, report, and module should all exist in AMP (if they didn't already before)

		if (!this.suppressSensitiveData) {
			// if possible, submit module screenshot to AMP
			if (this.driver && ('takeScreenshot' in this.driver) && (typeof this.driver.takeScreenshot === 'function')) {
				const screenshotDataURI = `data:image/png;base64,${await this.driver.takeScreenshot()}`;
				await NetworkUtil.postToAMP("/api/cont/module/screenshot", {
					moduleID: this.activeModule.id.toString(),
					data: screenshotDataURI
				}, true, this.driver, this.windowUnderTest);
			}
		}

		// convert accessibility concerns into the format AMP expects for uploading
		const records = this._convertAccessibilityConcernsToAMPFormat(accessibilityConcerns);

		// actually submit test results to AMP

		const bodyParams = {
			reportID: this.activeReport.id.toString(),
			moduleID: this.activeModule.id.toString(),
			overwrite: overwriteExistingAccessibilityConcerns.toString(),
			records: records
		};
		if (this.activeModule.name) {
			bodyParams.moduleName = this.activeModule.name;
		}
		if (this.activeModule.location) {
			bodyParams.moduleLocation = this.activeModule.location;
		}

		const responseJson = await NetworkUtil.postToAMP("/api/cont/module/upload", bodyParams, true, this.driver, this.windowUnderTest);
		return !!responseJson.moduleId;
	}

	/**
	 * Creates a new report in the active AMP asset.
	 *
	 * @private
	 * @param {string} reportName - the name of the AMP report to create
	 * @throws {IllegalStateException} if the active organization or asset is not set
	 * @throws {IllegalArgumentException} if the specified report name is null
	 * @throws {HttpErrorException} if an error is encountered while attempting to connect to AMP
	 * @throws {NotFoundException} if the active report cannot be created in AMP
	 * @returns {number} the ID of the AMP report created; null if the AMP report could not be created
	 */
	async _createReport(reportName) {
		if (!this.activeOrganizationId) {
			throw new IllegalStateException("Active organization has not been set");
		}

		if (!this.activeAssetId) {
			throw new IllegalStateException("Active asset has not been set");
		}

		if (!reportName) {
			throw new IllegalArgumentException("Active report cannot be null");
		}

		let reportId = null;

		const responseJson = await NetworkUtil.postToAMP("/api/cont/report/create", {
			assetId: this.activeAssetId,
			reportName: reportName,
			mediaTypeId: WEB_MEDIA_TYPE_ID
		}, true, this.driver, this.windowUnderTest);

		if (!responseJson.valid && responseJson.message) {
			throw new NotFoundException(responseJson.message);
		}

		if (responseJson.valid && responseJson.reportId) {
			reportId = responseJson.reportId;
		}

		return reportId;
	}

	/**
	 * Deletes any and all modules from the active AMP report.
	 *
	 * @private
	 * @throws {IllegalStateException} if the active organization, asset, or report is not set
	 * @throws {HttpErrorException} if an error is encountered while attempting to connect to AMP
	 * @throws {NotFoundException} if the active report in AMP cannot be accessed or found
	 * @returns {boolean} true if the deletion of all the active AMP report's modules succeeded; false if it did not
	 */
	async _deleteAllModulesInActiveReport() {
		if (!this.activeOrganizationId) {
			throw new IllegalStateException("Active organization has not been set");
		}

		if (!this.activeAssetId) {
			throw new IllegalStateException("Active asset has not been set");
		}

		if (!this.activeReport || !this.activeReport.id) {
			throw new IllegalStateException("Active report has not been set");
		}

		const responseJson = await NetworkUtil.postToAMP("/api/cont/report/overwrite", {
			assetId: this.activeAssetId,
			reportId: this.activeReport.id
		}, true, this.driver, this.windowUnderTest);

		if (!responseJson) {
			// this endpoint doesn't send back a response if it succeeds
			return true;
		}

		if (!responseJson.valid && responseJson.message) {
			throw new NotFoundException(responseJson.message);
		}

		return false;
	}

	/**
	 * Creates a new module in the active AMP report.
	 *
	 * @private
	 * @param {string} moduleName - the name of the AMP module to create
	 * @throws {IllegalStateException} if the active organization, asset, or report is not set, or if the active report is set but doesn't yet exist in AMP
	 * @throws {IllegalArgumentException} if the specified module name is null
	 * @throws {HttpErrorException} if an error is encountered while attempting to connect to AMP
	 * @throws {NotFoundException} if the active module cannot be created in AMP
	 * @returns {number} the ID of the AMP module created; null if the AMP module could not be created
	 */
	async _createModule(moduleName) {
		if (!this.activeOrganizationId) {
			throw new IllegalStateException("Active organization has not been set");
		}

		if (!this.activeAssetId) {
			throw new IllegalStateException("Active asset has not been set");
		}

		if (!this.activeReport || !this.activeReport.id) {
			throw new IllegalStateException("Active report has not been set");
		}

		if (!moduleName) {
			throw new IllegalArgumentException("Active module cannot be null");
		}

		let moduleId = null;

		const responseJson = await NetworkUtil.postToAMP("/api/cont/module/create", {
			assetId: this.activeAssetId.toString(),
			reportId: this.activeReport.id.toString(),
			moduleName: moduleName
		}, true, this.driver, this.windowUnderTest);

		if (!responseJson.valid && responseJson.message) {
			throw new NotFoundException(responseJson.message);
		}

		if (responseJson.valid && responseJson.moduleId) {
			moduleId = responseJson.moduleId;
		}

		return moduleId;
	}

	/**
	 * Converts accessibility concerns to the format AMP expects for reporting purposes.
	 *
	 * @private
	 * @param {AccessibilityConcern[]} accessibilityConcerns - the accessibility concerns to convert
	 * @returns {object} a JSON object that includes the specified accessibility concerns in a particular format
	 */
	_convertAccessibilityConcernsToAMPFormat(accessibilityConcerns) {
		const records = {};

		for (let i = 0; i < accessibilityConcerns.length; i++) {
			const accessibilityConcern = accessibilityConcerns[i];
			const result = accessibilityConcern.rawEngineJsonObject;

			const instance = {};

			let element = result.element;
			if (element) {
				if (this.suppressSensitiveData) {
					const match = element.match(/^<[^\s]+/i);
					if (match) {
						element = `<${match[0].substring(1).toLowerCase()}/>`;
					} else {
						element = '<unknown/>';
					}
				}

				instance.element = element.substring(0, Math.min(element.length, 3000));
			}

			const attributeDetail = this.suppressSensitiveData ? result.attribute : result.attributeDetail;
			instance.attribute = attributeDetail.substring(0, Math.min(attributeDetail.length, 3000));

			instance.xpath = result.path;
			instance.testResult = result.testResult;
			instance.engineTestId = result.engineTestId;

			// pass along stuff used by Alchemy
			const fixType = result.fixType;
			if (typeof fixType === 'object') {
				instance.fixType = fixType.fixType;
				instance.fix = fixType.fix;
				instance.fingerprint = result.fingerprint;
			}

			const bestPracticeIdString = result.bestPracticeId;
			let record = records[bestPracticeIdString];
			if (!record) {
				record = {};

				const violation = {};
				violation.violationID = result.bestPracticeId;
				record.violation = violation;

				const instances = [];
				instances.push(instance);
				record.instances = instances;

				records[bestPracticeIdString] = record;
			} else {
				const instances = record.instances;
				instances.push(instance);
			}
		}

		return records;
	}
}

/**
 * This class encapsulates all of functionality for submitting accessibility concerns identified using Continuum to Elevin.
 *
 * Reporting test results from Continuum to Elevin is accomplished through a kind of state machine, where you set the active Elevin instance, organization, asset, report, and module to use; once these are set, they remain set for as long as they're not set again and for as long as Continuum is initialized.
 * Depending on the report and module management strategies you decide to use—see {@link ReportManagementStrategy} and {@link ModuleManagementStrategy}, respectively—invoking {@link ElevinReportingService#submitAccessibilityConcernsToElevin} will first create, overwrite, and/or delete reports and modules from Elevin, then publish your test results to the active Elevin module.
 * You can set the active report and module management strategies using {@link ElevinReportingService#setActiveReportManagementStrategy} and {@link ElevinReportingService#setActiveModuleManagementStrategy}, respectively.
 * Only once all of these active items are set should you invoke {@link ElevinReportingService#submitAccessibilityConcernsToElevin} using the list of accessibility concerns you'd like to report.
 *
 * More on report and module management strategies: they are designed with two primary use cases in mind: continuous integration (CI) workflows (where you usually want to retain the results of previously published reports), and more manual workflows (e.g. when Continuum is run from a developer's local workstation, where you usually don't want to retain the results of previously published reports).
 * Here? Choosing the correct report and module management strategies to meet your business objectives is critical to using Continuum's Elevin reporting functionality correctly, so please consult our support documentation for more information.
 *
 * @hideconstructor
 */

class ElevinReportingService {
	/**
	 * @constructor
	 * @returns {ElevinReportingService}
	 */
	constructor(driver, windowUnderTest) {
		this._driver = driver;
		this._windowUnderTest = windowUnderTest;
		this._activeScanId = null;
	}

	get activeScanId() {
		return this._activeScanId;
	}

	set activeScanId(activeScanId) {
		this._activeScanId = activeScanId;
	}

	/**
	 * @private
	 * @returns {*}
	 */
	get driver() {
		return this._driver;
	}

	set driver(driver) {
		this._driver = driver;
	}

	/**
	 * @private
	 * @returns {Window}
	 */
	get windowUnderTest() {
		return this._windowUnderTest;
	}

	set windowUnderTest(window) {
		this._windowUnderTest = window;
	}

	validateConfigurationProperties() {
		if (!Configuration.getAccessibilityConcernsConfiguration()) {
			throw new IllegalStateException("Configuration property 'accessibilityConcerns' is required, but could not be found");
		}

		if ((!Configuration.getAccessibilityConcernsConfiguration().format)
			|| Configuration.getAccessibilityConcernsConfiguration().format !== 'elevin') {
			throw new IllegalStateException(
				"Configuration property 'accessibilityConcerns.format' is required, but no valid value could be found. Please make sure the property's value is set to 'elevin'."
			);
		}

		if (!Configuration.getElevinConfiguration()) {
			throw new IllegalStateException("Configuration propery 'elevin' is required, but could not be found");
		}

		if (!Configuration.getElevinConfiguration().getBaseUrl()) {
			throw new IllegalStateException("Configuration property 'elevin.baseUrl' is required, but no valid value could be found");
		}

		if (!Configuration.getElevinConfiguration().getApiKey()) {
			throw new IllegalStateException("Configuration property 'elevin.apiKey' is required, but no valid value could be found");
		}
	}

	/**
	 * Begins a new Elevin scan. This must be done in order for any assertions to be submitted to Elevin.
	 * Note that there can be at most one active scan at a time. If there is an active scan and an attempt
	 * is made to begin a new one the Elevin service will reject the request resulting in an exception
	 * being thrown.
	 *
	 * @returns {String}
	 * @throws HttpErrorException
	 * @throws IllegalStateException
	 */
	async beginScan() {
		const storageAvailabe = typeof sessionStorage !== 'undefined';
		this.validateConfigurationProperties();

		if (this.activeScanId || (storageAvailabe && sessionStorage.getItem('activeScanId'))) {
			throw new IllegalStateException("Cannot begin a new scan while there is an active scan in progress.");
		}

		let response;

		try {
			response = await NetworkUtil.sendToElevin({
				method: 'POST',
				url: '/accounts/continuum/scans',
				payload: null,
				driver: this.driver,
				windowUnderTest: this.windowUnderTest,
			});
		} catch (e) {
			throw new HttpErrorException(`Unexpectedly encountered a non-200 status code while attempting to POST data`);
		}

		const { scanId } = response;

		if (scanId) {
			this.activeScanId = scanId;

			if (storageAvailabe) {
				sessionStorage.setItem("activeScanId", scanId);
			}
			return this.activeScanId;
		}

		return null;
	}

	/**
	 * Submits the supplied assertions to Elevin for the current page within the currently active scan.
	 * Note that a scan must have been started prior to this method being called, otherwise an exception will be thrown.
	 *
	 * @param assertions The list of assertions to be sent to Elevin for the currently active scan.
	 * @throws Exception
	 * @throws HttpErrorException
	 * @throws IllegalStateException
	 */
	async submit(assertions) {
		const storageAvailabe = typeof sessionStorage !== 'undefined';
		const scanId = this.activeScanId || (storageAvailabe && sessionStorage.getItem('activeScanId'));
		const resizeScreenshot = ({ dataUrl, maxWidth = 1024 }) => {
			return this.driver.executeAsyncScript(`
				const callback = arguments[0];
				const img = new Image();
				img.crossOrigin = 'Anonymous';
				img.onload = function () {
					const canvas = document.createElement('canvas');
					canvas.width = Math.min(img.width, ${maxWidth});
					canvas.height = (canvas.width / img.width) * img.height;
					canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
					callback(canvas.toDataURL('image/jpeg'));
				};
				img.src = "${dataUrl}";
			`);
		};

		this.validateConfigurationProperties();

		if (!scanId) {
			throw new IllegalStateException("Cannot submit assertions if there is not an active scan in progress.");
		}

		const metadata = await continuum.getPageMetadata();
		const environment = new Environment(
			metadata.orientation,
			metadata.userAgent,
			metadata.width,
			metadata.height,
			metadata.docWidth,
			metadata.docHeight
		);
		let screenshotDataURI = null;

		if (this.driver && ('takeScreenshot' in this.driver) && (typeof this.driver.takeScreenshot === 'function')) {
			try {
				screenshotDataURI = await resizeScreenshot({
					dataUrl: `data:image/png;base64,${await this.driver.takeScreenshot()}`,
				});
			} catch (e) {
				console.error(
					"Failed to take screenshot. The test results will be submitted without a screenshot. Reason", e.message
				);
			}
		}

		let subject = null;

		if (this.driver) {
			subject = await this.driver.getCurrentUrl();
		} else if (this.windowUnderTest) {
			subject = this.windowUnderTest.document.location.href;
		}

		let impressionId = null;
		if (typeof crypto !== 'undefined') {
			impressionId = crypto.randomUUID();
		} else if (this.driver) {
			impressionId = require('crypto').randomUUID();
		} else {
			impressionId = Continuum.getRandomUUID();
		}

		const timestamp = new Date().toISOString();
		const testResults = new UnifiedTestResults(
			subject,
			metadata.title,
			impressionId,
			timestamp,
			metadata.engineSuccess,
			environment.toObject(),
			assertions,
			screenshotDataURI
		);

		try {
			await NetworkUtil.sendToElevin({
				method: "POST",
				url: `/accounts/continuum/scans/${scanId}/testing/results`,
				payload: testResults.toObject(),
				driver: this.driver,
				windowUnderTest: this.windowUnderTest
			});
		} catch (e) {
			console.log(e);
			throw new HttpErrorException(`Unexpectedly encountered a non-200 status code while attempting to POST data`);
		}
	}

	/**
	 * Completes the currently active Elevin scan. After calling this method no further assertions will be accepted for the currently active scan id.
	 * Note that a scan must have been started prior to this method being called, otherwise an exception will be thrown.
	 *
	 * @throws HttpErrorException
	 * @throws IllegalStateException
	 */
	async completeScan() {
		const storageAvailabe = typeof sessionStorage !== 'undefined';
		const scanId = this.activeScanId || (storageAvailabe && sessionStorage.getItem('activeScanId'));

		this.validateConfigurationProperties();

		if (!scanId) {
			throw new IllegalStateException("Cannot complete a scan if there is not an active scan in progress");
		}

		try {
			await NetworkUtil.sendToElevin({
				method: "PUT",
				url: `/accounts/continuum/scans/${scanId}`,
				payload: null,
				driver: this.driver,
				windowUnderTest: this.windowUnderTest
			});
		} catch (e) {
			console.log(e);
			throw new HttpErrorException(`Unexpectedly encountered a non-200 status code while attempting to ${method} data from/to ${url}`);
		}

		this.activeScanId = null;
		if (storageAvailabe) {
			sessionStorage.removeItem('activeScanId');
		}
	}
}

/**
 * Defines supported strategies with which to create new reports and edit existing ones.
 * Choosing the correct report management strategy to meet your business objectives is critical to using Continuum's AMP reporting functionality correctly, so please consult our support documentation for more information.
 *
 * @readonly
 * @namespace
 * @type {object}
 */
const ReportManagementStrategy = Object.freeze({
	/**
	 * Append any new modules to a report, creating the report first if it doesn't already exist; do not overwrite any existing reports.
	 * Useful for intentionally adding to an existing report, e.g. one that was just created recently, rather than creating a new report.
	 *
	 * @type {string}
	 * @alias APPEND
	 * @memberof! ReportManagementStrategy#
	 */
	APPEND: "APPEND",

	/**
	 * Overwrite existing reports when a report with the same ID or name already exists, deleting any existing modules in the report in AMP prior to repopulating it with any new modules.
	 * This is the recommended strategy for a more manual report generation workflow, e.g. when a developer is creating new reports from their own workstation, or when there is otherwise little reason to retain old reports.
	 * While using this report management strategy, make sure to specify active modules by name (via {@link AMPReportingService#setActiveModuleByName}) rather than by ID (via {@link AMPReportingService#setActiveModuleById}); any modules in the active report—including the active module, assuming it's in the active report—will be deleted from AMP next time {@link AMPReportingService#submitAccessibilityConcernsToAMP} is invoked, making the active module ID invalid before any test results can be submitted to the module in AMP it used to reference, which will cause Continuum to throw a {@link NotFoundException}.
	 *
	 * @type {string}
	 * @alias OVERWRITE
	 * @memberof! ReportManagementStrategy#
	 */
	OVERWRITE: "OVERWRITE",

	/**
	 * Always create new reports, guaranteeing uniqueness by appending the current date and time as an ISO 8601 timestamp to the end of each report's name; do not overwrite or append modules to any existing reports.
	 * This is the recommended strategy for a continuous integration (CI) workflow, i.e. for a report generation process that's automatically performed periodically, or when you otherwise don't wish to overwrite any previous reports for record keeping purposes.
	 *
	 * @type {string}
	 * @alias UNIQUE
	 * @memberof! ReportManagementStrategy#
	 */
	UNIQUE: "UNIQUE"
});

/**
 * Defines supported strategies with which to create new modules and edit existing ones.
 * Choosing the correct module management strategy to meet your business objectives is critical to using Continuum's AMP reporting functionality correctly, so please consult our support documentation for more information.
 *
 * @readonly
 * @namespace
 * @type {object}
 */
const ModuleManagementStrategy = Object.freeze({
	/**
	 * Append any new accessibility concerns to a module, creating the module first if it doesn't already exist; do not overwrite any existing modules.
	 * Useful for intentionally adding to an existing module, e.g. one that was just created recently, rather than creating a new module.
	 *
	 * @type {string}
	 * @alias APPEND
	 * @memberof! ModuleManagementStrategy#
	 */
	APPEND: "APPEND",

	/**
	 * Overwrite existing modules when a module with the same ID or name already exists, deleting any existing accessibility concerns in the module prior to repopulating it with any new accessibility concerns.
	 *
	 * @type {string}
	 * @alias OVERWRITE
	 * @memberof! ModuleManagementStrategy#
	 */
	OVERWRITE: "OVERWRITE",

	/**
	 * Don't report to AMP when a module with the same ID or name already exists; do not overwrite or append accessibility concerns to the existing module.
	 *
	 * @type {string}
	 * @alias ABORT
	 * @memberof! ModuleManagementStrategy#
	 */
	ABORT: "ABORT"
});

/**
 * This class encapsulates Metadata info for the current page relevant to an Elevin report.
 *
 */
class Metadata {
	constructor() {
		this._contentType = null;
		this._title = null;
		this._redirectedUrl = null;
		this._width = null;
		this._height = null;
		this._docHeight = null;
		this._docWidth = null;
		this._orientation = null;
		this._userAgent = null;
		this._engineSuccess = null;
	}

	get contentType() {
		return this._contentType;
	}

	set contentType(contentType) {
		this._contentType = contentType;
	}

	get title() {
		return this._title;
	}

	set title(title) {
		this._title = title;
	}

	get redirectedUrl() {
		return this._redirectedUrl;
	}

	set redirectedUrl(redirectedUrl) {
		this._redirectedUrl = redirectedUrl;
	}

	get width() {
		return this._width;
	}

	set width(width) {
		this._width = width;
	}

	get height() {
		return this._height;
	}

	set height(height) {
		this._height = height;
	}

	get docHeight() {
		return this._docHeight;
	}

	set docHeight(docHeight) {
		this._docHeight = docHeight;
	}

	get docWidth() {
		return this._docWidth;
	}

	set docWidth(docWidth) {
		this._docWidth = docWidth;
	}

	get orientation() {
		return this._orientation;
	}

	set orientation(orientation) {
		this._orientation = orientation;
	}

	get userAgent() {
		return this._userAgent;
	}

	set userAgent(userAgent) {
		this._userAgent = userAgent;
	}

	get engineSuccess() {
		return this._engineSuccess;
	}

	set engineSuccess(engineSuccess) {
		this._engineSuccess = engineSuccess;
	}
}

/**
 * This class encapsulates Environment info for the current page.
 *
 */
class Environment {
	constructor(
		orientation,
		userAgent,
		width,
		height,
		docWidth,
		docHeight
	) {
		this._orientation = orientation;
		this._userAgent = userAgent;
		this._width = width;
		this._height = height;
		this._docWidth = docWidth;
		this._docHeight = docHeight;
	}

	get orientation() {
		return this._orientation;
	}

	set orientation(orientation) {
		this._orientation = orientation;
	}

	get userAgent() {
		return this._userAgent;
	}

	set userAgent(userAgent) {
		this._userAgent = userAgent;
	}

	get height() {
		return this._height;
	}

	set height(heigth) {
		this._height = heigth;
	}

	get width() {
		return this._width;
	}

	set width(width) {
		this._width = width;
	}

	get docWidth() {
		return this._docWidth;
	}

	set docWidth(docWidth) {
		this._docWidth = docWidth;
	}

	get docHeight() {
		return this._docHeight;
	}

	set docHeight(docHeight) {
		this._docHeight = docHeight;
	}

	toObject() {
		return {
			orientation: this._orientation || "",
			userAgent: this._userAgent,
			width: this._width,
			height: this._height,
			docHeight: this._docHeight || this._height,
			docWidth: this._docWidth || this._width
		};
	}
}

class Assertion {
	constructor() {
		this._testId = null;
		this._testType = null;
		this._outcome = null;
		this._results = [];
	}

	get testId() {
		return this._testId;
	}

	set testId(testId) {
		this._testId = testId;
	}

	get testType() {
		return this._testType;
	}

	set testType(testType) {
		this._testType = testType;
	}

	get outcome() {
		return this._outcome;
	}

	set outcome(outcome) {
		this._outcome = outcome;
	}

	get results() {
		return this._results;
	}

	set results(results) {
		this._results = results;
	}

	getTestURL() {
		return this._testId ? `https://accessipedia.elevin.cloud/test/${this.testId}` : null;
	}

	static toJSON() {
		return {
			testId: this._testId,
			testType: this._testType,
			outcome: this._outcome,
			results: this._results
		};
	}

	static fromJSON(data) {
		const { testId, testType, outcome, results } = data;

		return {
			testId,
			testType,
			outcome,
			results,
		};
	}
}

class ClusteringData {
	constructor() {
		this._uniqueId = null;
		this._tagName = null;
		this._attributes = null;
		this._text = null;
		this._children = [];
	}

	static toJSON() {
		return {
			uniqueId: this._uniqueId,
			tagName: this._tagName,
			attributes: this._attributes,
			text: this._text,
			children: this._children
		};
	}

	static fromJSON(data) {
		const { uniqueId, tagName, attributes, text, children } = data;

		return {
			uniqueId,
			tagName,
			attributes,
			text,
			children
		};
	}
}

class TestResult {
	constructor() {
		this._attrNo = null;
		this._css = null;
		this._uel = null;
		this._encoding = [];
		this._element = null;
		this._timestamp = null;
		this._clusteringData = null;
	}

	static toJSON() {
		return JSON.stringify({
			attrNo: this._attrNo,
			css: this._css,
			uel: this._uel,
			encoding: this._encoding,
			element: this._element,
			timestamp: this._timestamp,
			clusteringData: this._clusteringData
		});
	}

	static fromJSON(data) {
		const {
			attrNo,
			css,
			uel,
			encoding,
			element,
			timestamp,
			clusteringData
		} = data;

		return {
			attrNo,
			css,
			uel,
			encoding,
			element,
			timestamp,
			clusteringData
		};
	}
}

/**
 * This class encapsulates UnifiedTestResults submitted to Evelin.
 *
 */
class UnifiedTestResults {
	constructor(
		subject,
		title,
		impressionId,
		timestamp,
		engineSuccess,
		environment,
		assertions,
		screenshot,
	) {
		this._subject = subject;
		this._title = title;
		this._impressionId = impressionId;
		this._timestamp = timestamp;
		this._engineSuccess = engineSuccess;
		this._environment = environment;
		this._assertions = assertions;
		this._screenshot = screenshot;
	}

	get subject() {
		return this._subject;
	}

	set subject(subject) {
		this._subject = subject;
	}

	get title() {
		return this._title;
	}

	set title(title) {
		this._title = title;
	}

	get impressionId() {
		return this._impressionId;
	}

	set impressionId(impressionId) {
		this._impressionId = impressionId;
	}

	get timestamp() {
		return this._timestamp;
	}

	set timestamp(timestamp) {
		this._timestamp = timestamp;
	}

	get engineSuccess() {
		return this._engineSuccess;
	}

	set engineSuccess(engineSuccess) {
		this._engineSuccess = engineSuccess;
	}

	get environment() {
		return this._environment;
	}

	set environment(environment) {
		this._environment = environment;
	}

	get assertions() {
		return this._assertions;
	}

	set assertions(assertions) {
		this._assertions = assertions;
	}

	get screenshot() {
		return this._screenshot;
	}

	set screenshot(screenshot) {
		this._screenshot = screenshot;
	}

	toObject() {
		return {
			subject: this._subject,
			title: this._title,
			impressionId: this._impressionId,
			timestamp: this._timestamp,
			engineSuccess: this._engineSuccess,
			environment: this._environment,
			assertions: this._assertions,
			screenshot: this._screenshot,
		};
	}
}

/**
 * This class encapsulates all the metadata relevant to an AMP report.
 *
 * @hideconstructor
 */
class Report {

	/**
	 * @constructor
	 * @returns {Report}
	 */
	constructor(id, name) {
		this._id = id;
		this._name = name;
	}

	/**
	 * Gets the ID of this report.
	 * This will be null if this report does not yet exist in AMP.
	 *
	 * @returns {?number} the ID of this report in AMP; null if this report does not yet exist in AMP
	 */
	get id() {
		return this._id;
	}

	/**
	 * @private
	 * @param id
	 */
	set id(id) {
		this._id = id;
	}

	/**
	 * Gets the name of this report.
	 *
	 * @returns {string} the name of this report
	 */
	get name() {
		return this._name;
	}

	/**
	 * @private
	 * @param name
	 */
	set name(name) {
		this._name = name;
	}

	/**
	 * Gets the URL to this report in AMP.
	 *
	 * @returns {?string} the URL to this report in AMP; null if this report does not yet exist in AMP
	 */
	getAMPUrl() {
		return (this._id ? `${Configuration.getAmpInstanceUrl()}/public/reporting/view_report.php?report_id=${this._id}` : null);
	}
}

/**
 * This class encapsulates all the metadata relevant to an AMP module.
 *
 * @hideconstructor
 */
class Module {

	/**
	 * @constructor
	 * @returns {Module}
	 */
	constructor(id, name, location) {
		this._id = id;
		this._name = name;
		this._location = location;
	}

	/**
	 * Gets the ID of this module.
	 * This will be null if this module does not yet exist in AMP.
	 *
	 * @returns {?number} the ID of this module in AMP; null if this module does not yet exist in AMP
	 */
	get id() {
		return this._id;
	}

	/**
	 * @private
	 * @param id
	 */
	set id(id) {
		this._id = id;
	}

	/**
	 * Gets the name of this module.
	 *
	 * @returns {string} the name of this module
	 */
	get name() {
		return this._name;
	}

	/**
	 * @private
	 * @param name
	 */
	set name(name) {
		this._name = name;
	}

	/**
	 * Gets the location of this module.
	 *
	 * @returns {string} the location of this module
	 */
	get location() {
		return this._location;
	}

	/**
	 * @private
	 * @param location
	 */
	set location(location) {
		this._location = location;
	}

	/**
	 * Gets the URL to this module in AMP.
	 *
	 * @returns {?string} the URL to this module in AMP; null if this module does not yet exist in AMP
	 */
	getAMPUrl() {
		return (this._id ? `${Configuration.getAmpInstanceUrl()}/public/reporting/view_module.php?module_id=${this._id}` : null);
	}
}

/**
 * This class encapsulates shared utility functions shared across our other classes.
 *
 * @private
 */
class PlatformUtil {

	/**
	 * (Heuristically) gets the name of the active platform runtime.
	 * Returns null if the runtime can't be determined or isn't natively supported.
	 *
	 * @returns {?string}
	 */
	static getRuntimeName() {
		if ((typeof require === 'function') && require('fs') && ('readFileSync' in require('fs'))) {
			return 'Node';
		} else {
			return null;
		}
	}
}

/**
 * Signals that a method has been invoked at an illegal or inappropriate time.
 */
class IllegalStateException extends Error {}

/**
 * Thrown to indicate that a method has been passed an illegal or inappropriate argument.
 */
class IllegalArgumentException extends Error {}

/**
 * The class indicates a problem was encountered while connecting to a remote resource via HTTP/HTTPS.
 */
class HttpErrorException extends Error {}

/**
 * The class indicates an expected entity could not be found.
 */
class NotFoundException extends Error {}

/**
 * A global reference to Continuum.
 *
 * @const
 * @type {Continuum}
 */
const continuum = new Continuum();

// TODO: https://levelaccess-internal.atlassian.net/browse/CONT-846
if (typeof document !== 'undefined') {
	const body = document.getElementsByTagName('body')[0];

	if (body) {
		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = 'https://cdn.jsdelivr.net/pako/1.0.3/pako.min.js';
		body.appendChild(script);
	}
}

if (typeof module !== 'undefined') {
	module.exports.Continuum = continuum;
	module.exports.ReportManagementStrategy = ReportManagementStrategy;
	module.exports.ModuleManagementStrategy = ModuleManagementStrategy;
}
