import testContext from '@utils/testContext';
import {expect} from 'chai';

import {
  boCartRulesPage,
  boCatalogPriceRulesPage,
  boCatalogPriceRulesCreatePage,
  boDashboardPage,
  boLoginPage,
  type BrowserContext,
  FakerCatalogPriceRule,
  type Page,
  utilsCore,
  utilsDate,
  utilsPlaywright,
} from '@prestashop-core/ui-testing';

const baseContext: string = 'functional_BO_catalog_discounts_catalogPriceRules_filterSortAndPagination';

/*
Create 21 catalog price rules
Filter catalog price rules by id, Name, Shop, Currency, Country, Group, From quantity, Reduction type,
Reduction, Beginning, End
Sort catalog price rules by id, Name, Shop, Currency, Country, Group, From quantity, Reduction type,
Reduction, Beginning, End
Pagination next and previous
Delete created catalog price rules by bulk actions
 */
describe('BO - Catalog - Discounts : Filter, sort and pagination catalog price rules table', async () => {
  let browserContext: BrowserContext;
  let page: Page;
  let numberOfCatalogPriceRules: number = 0;

  const today: string = utilsDate.getDateFormat('yyyy-mm-dd');
  const dateToCheck: string = utilsDate.getDateFormat('mm/dd/yyyy');
  const priceRuleData: FakerCatalogPriceRule = new FakerCatalogPriceRule({fromDate: today, toDate: today});

  // before and after functions
  before(async function () {
    browserContext = await utilsPlaywright.createBrowserContext(this.browser);
    page = await utilsPlaywright.newTab(browserContext);
  });

  after(async () => {
    await utilsPlaywright.closeBrowserContext(browserContext);
  });

  it('should login in BO', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'loginBO', baseContext);

    await boLoginPage.goTo(page, global.BO.URL);
    await boLoginPage.successLogin(page, global.BO.EMAIL, global.BO.PASSWD);

    const pageTitle = await boDashboardPage.getPageTitle(page);
    expect(pageTitle).to.contains(boDashboardPage.pageTitle);
  });

  it('should go to \'Catalog > Discounts\' page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToDiscountsPage', baseContext);

    await boDashboardPage.goToSubMenu(
      page,
      boDashboardPage.catalogParentLink,
      boDashboardPage.discountsLink,
    );

    const pageTitle = await boCartRulesPage.getPageTitle(page);
    expect(pageTitle).to.contains(boCartRulesPage.pageTitle);
  });

  it('should go to \'Catalog Price Rules\' tab', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToCatalogPriceRulesTab', baseContext);

    await boCartRulesPage.goToCatalogPriceRulesTab(page);

    numberOfCatalogPriceRules = await boCatalogPriceRulesPage.resetAndGetNumberOfLines(page);

    const pageTitle = await boCatalogPriceRulesPage.getPageTitle(page);
    expect(pageTitle).to.contains(boCatalogPriceRulesPage.pageTitle);
  });

  // 1 - Create 21 catalog price rules
  describe('Create 21 catalog price rules in BO', async () => {
    const creationTests: number[] = new Array(21).fill(0, 0, 21);
    creationTests.forEach((test: number, index: number) => {
      const priceRuleData: FakerCatalogPriceRule = new FakerCatalogPriceRule({
        name: `todelete${index}`,
        fromDate: today,
        toDate: today,
      });

      it('should go to new catalog price rule page', async function () {
        await testContext.addContextItem(this, 'testIdentifier', `goToNewCatalogPriceRule${index}`, baseContext);

        await boCatalogPriceRulesPage.goToAddNewCatalogPriceRulePage(page);

        const pageTitle = await boCatalogPriceRulesCreatePage.getPageTitle(page);
        expect(pageTitle).to.contains(boCatalogPriceRulesCreatePage.pageTitle);
      });

      it(`should create catalog price rule n°${index + 1}`, async function () {
        await testContext.addContextItem(this, 'testIdentifier', `createCatalogPriceRule${index}`, baseContext);

        const validationMessage = await boCatalogPriceRulesCreatePage.setCatalogPriceRule(page, priceRuleData);
        expect(validationMessage).to.contains(boCatalogPriceRulesPage.successfulCreationMessage);

        const numberOfCatalogPriceRulesAfterCreation = await boCatalogPriceRulesPage.getNumberOfElementInGrid(page);
        expect(numberOfCatalogPriceRulesAfterCreation).to.be.at.most(numberOfCatalogPriceRules + index + 1);
      });
    });
  });

  // 2 - Filter catalog price rules table
  describe('Filter catalog price rules table', async () => {
    const tests = [
      {
        args: {
          testIdentifier: 'filterID', filterType: 'input', filterBy: 'id_specific_price_rule', filterValue: '1',
        },
      },
      {
        args: {
          testIdentifier: 'filterName', filterType: 'input', filterBy: 'a!name', filterValue: priceRuleData.name,
        },
      },
      {
        args: {
          testIdentifier: 'filterCurrency',
          filterType: 'input',
          filterBy: 'cul!name',
          filterValue: priceRuleData.currency,
        },
      },
      {
        args: {
          testIdentifier: 'filterCountry',
          filterType: 'input',
          filterBy: 'cl!name',
          filterValue: priceRuleData.country,
        },
      },
      {
        args: {
          testIdentifier: 'filterGroup', filterType: 'input', filterBy: 'gl!name', filterValue: priceRuleData.group,
        },
      },
      {
        args: {
          testIdentifier: 'filterFromQuantity',
          filterType: 'input',
          filterBy: 'from_quantity',
          filterValue: priceRuleData.fromQuantity.toString(),
        },
      },
      {
        args: {
          testIdentifier: 'filterReductionType',
          filterType: 'select',
          filterBy: 'a!reduction_type',
          filterValue: priceRuleData.reductionType,
        },
      },
      {
        args: {
          testIdentifier: 'filterReduction',
          filterType: 'input',
          filterBy: 'reduction',
          filterValue: priceRuleData.reduction.toString(),
        },
      },
    ];

    tests.forEach((test) => {
      it(`should filter by ${test.args.filterBy} '${test.args.filterValue}'`, async function () {
        await testContext.addContextItem(this, 'testIdentifier', test.args.testIdentifier, baseContext);

        await boCatalogPriceRulesPage.filterPriceRules(
          page,
          test.args.filterType,
          test.args.filterBy,
          test.args.filterValue,
        );

        const numberOfPriceRulesAfterFilter = await boCatalogPriceRulesPage.getNumberOfElementInGrid(page);
        expect(numberOfPriceRulesAfterFilter).to.be.at.most(numberOfCatalogPriceRules + 21);

        for (let row = 1; row <= numberOfPriceRulesAfterFilter; row++) {
          const textColumn = await boCatalogPriceRulesPage.getTextColumn(page, row, test.args.filterBy);
          expect(textColumn).to.contains(test.args.filterValue);
        }
      });

      it('should reset all filters', async function () {
        await testContext.addContextItem(this, 'testIdentifier', `${test.args.testIdentifier}Reset`, baseContext);

        const numberOfPriceRulesAfterReset = await boCatalogPriceRulesPage.resetAndGetNumberOfLines(page);
        expect(numberOfPriceRulesAfterReset).to.equal(numberOfCatalogPriceRules + 21);
      });
    });

    const filterByDate = [
      {
        args: {
          testIdentifier: 'filterDateBeginning',
          filterBy: 'from',
          firstDate: today,
          secondDate: today,
        },
      },
      {
        args: {
          testIdentifier: 'filterDateEnd',
          filterBy: 'to',
          firstDate: today,
          secondDate: today,
        },
      },
    ];
    filterByDate.forEach((test) => {
      it('should filter by date Beginning and date End', async function () {
        await testContext.addContextItem(this, 'testIdentifier', test.args.testIdentifier, baseContext);

        // Filter by date
        await boCatalogPriceRulesPage.filterByDate(page, test.args.filterBy, test.args.firstDate, test.args.secondDate);

        // Get number of elements
        const numberOfShoppingCartsAfterFilter = await boCatalogPriceRulesPage.getNumberOfElementInGrid(page);

        for (let row = 1; row <= numberOfShoppingCartsAfterFilter; row++) {
          const textColumn = await boCatalogPriceRulesPage.getTextColumn(
            page,
            row,
            test.args.filterBy,
          );
          expect(textColumn).to.contains(dateToCheck);
        }
      });

      it('should reset all filters', async function () {
        await testContext.addContextItem(this, 'testIdentifier', `${test.args.testIdentifier}Reset`, baseContext);

        const numberOfPriceRulesAfterReset = await boCatalogPriceRulesPage.resetAndGetNumberOfLines(page);
        expect(numberOfPriceRulesAfterReset).to.equal(numberOfCatalogPriceRules + 21);
      });
    });
  });

  // 3 - Sort Price rules table
  describe('Sort catalog price rules table', async () => {
    const sortTests = [
      {
        args: {
          testIdentifier: 'sortByIdDesc', sortBy: 'id_specific_price_rule', sortDirection: 'down', isFloat: true,
        },
      },
      {
        args: {
          testIdentifier: 'sortByNameAsc', sortBy: 'a!name', sortDirection: 'up',
        },
      },
      {
        args: {
          testIdentifier: 'sortByNameDesc', sortBy: 'a!name', sortDirection: 'down',
        },
      },
      {
        args: {
          testIdentifier: 'sortByCurrencyAsc', sortBy: 'cul!name', sortDirection: 'up',
        },
      },
      {
        args: {
          testIdentifier: 'sortByCurrencyDesc', sortBy: 'cul!name', sortDirection: 'down',
        },
      },
      {
        args: {
          testIdentifier: 'sortByCountryAsc', sortBy: 'cl!name', sortDirection: 'up',
        },
      },
      {
        args: {
          testIdentifier: 'sortByCountryDesc', sortBy: 'cl!name', sortDirection: 'down',
        },
      },
      {
        args: {
          testIdentifier: 'sortByGroupAsc', sortBy: 'gl!name', sortDirection: 'up',
        },
      },
      {
        args: {
          testIdentifier: 'sortByGroupDesc', sortBy: 'gl!name', sortDirection: 'down',
        },
      },
      {
        args: {
          testIdentifier: 'sortByFromQuantityAsc', sortBy: 'from_quantity', sortDirection: 'up', isFloat: true,
        },
      },
      {
        args: {
          testIdentifier: 'sortByFromQuantityDesc', sortBy: 'from_quantity', sortDirection: 'down', isFloat: true,
        },
      },
      {
        args: {
          testIdentifier: 'sortByReducingTypeAsc', sortBy: 'a!reduction_type', sortDirection: 'up',
        },
      },
      {
        args: {
          testIdentifier: 'sortByReductionTypeDesc', sortBy: 'a!reduction_type', sortDirection: 'down',
        },
      },
      {
        args: {
          testIdentifier: 'sortByReductionAsc', sortBy: 'reduction', sortDirection: 'up', isFloat: true,
        },
      },
      {
        args: {
          testIdentifier: 'sortByReductionDesc', sortBy: 'reduction', sortDirection: 'down', isFloat: true,
        },
      },
      {
        args: {
          testIdentifier: 'sortByDateFromAsc', sortBy: 'from', sortDirection: 'up', isDate: true,
        },
      },
      {
        args: {
          testIdentifier: 'sortByDateFromDesc', sortBy: 'from', sortDirection: 'down', isDate: true,
        },
      },
      {
        args: {
          testIdentifier: 'sortByDateToAsc', sortBy: 'to', sortDirection: 'up', isDate: true,
        },
      },
      {
        args: {
          testIdentifier: 'sortByDateToDesc', sortBy: 'to', sortDirection: 'down', isDate: true,
        },
      },
      {
        args: {
          testIdentifier: 'sortByIdAsc', sortBy: 'id_specific_price_rule', sortDirection: 'up', isFloat: true,
        },
      },
    ];

    sortTests.forEach((test) => {
      it(`should sort by '${test.args.sortBy}' '${test.args.sortDirection}' and check result`, async function () {
        await testContext.addContextItem(this, 'testIdentifier', test.args.testIdentifier, baseContext);

        const nonSortedTable = await boCatalogPriceRulesPage.getAllRowsColumnContent(page, test.args.sortBy);

        await boCatalogPriceRulesPage.sortTable(page, test.args.sortBy, test.args.sortDirection);

        const sortedTable = await boCatalogPriceRulesPage.getAllRowsColumnContent(page, test.args.sortBy);

        if (test.args.isFloat) {
          const nonSortedTableFloat: number[] = nonSortedTable.map((text: string): number => parseFloat(text));
          const sortedTableFloat: number[] = sortedTable.map((text: string): number => parseFloat(text));

          const expectedResult: number[] = await utilsCore.sortArrayNumber(nonSortedTableFloat);

          if (test.args.sortDirection === 'up') {
            expect(sortedTableFloat).to.deep.equal(expectedResult);
          } else {
            expect(sortedTableFloat).to.deep.equal(expectedResult.reverse());
          }
        } else if (test.args.isDate) {
          const expectedResult: string[] = await utilsCore.sortArrayDate(nonSortedTable);

          if (test.args.sortDirection === 'up') {
            expect(sortedTable).to.deep.equal(expectedResult);
          } else {
            expect(sortedTable).to.deep.equal(expectedResult.reverse());
          }
        } else {
          const expectedResult: string[] = await utilsCore.sortArray(nonSortedTable);

          if (test.args.sortDirection === 'up') {
            expect(sortedTable).to.deep.equal(expectedResult);
          } else {
            expect(sortedTable).to.deep.equal(expectedResult.reverse());
          }
        }
      });
    });
  });

  // 4 - Pagination
  describe('Pagination next and previous', async () => {
    it('should change the items number to 20 per page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'changeItemsNumberTo20', baseContext);

      const paginationNumber = await boCatalogPriceRulesPage.selectPaginationLimit(page, 20);
      expect(paginationNumber).to.equal('1');
    });

    it('should click on next', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'clickOnNext', baseContext);

      const paginationNumber = await boCatalogPriceRulesPage.paginationNext(page);
      expect(paginationNumber).to.equal('2');
    });

    it('should click on previous', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'clickOnPrevious', baseContext);

      const paginationNumber = await boCatalogPriceRulesPage.paginationPrevious(page);
      expect(paginationNumber).to.equal('1');
    });

    it('should change the item number to 50 per page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'changeItemsNumberTo50', baseContext);

      const paginationNumber = await boCatalogPriceRulesPage.selectPaginationLimit(page, 50);
      expect(paginationNumber).to.equal('1');
    });
  });

  // 5 - Delete catalog price rules with bulk actions
  describe('Bulk delete catalog price rules', async () => {
    it('should bulk delete cart rules', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'bulkDeletePriceRules', baseContext);

      const deleteTextResult = await boCatalogPriceRulesPage.bulkDeletePriceRules(page);
      expect(deleteTextResult).to.be.contains(boCatalogPriceRulesPage.successfulMultiDeleteMessage);
    });
  });
});
