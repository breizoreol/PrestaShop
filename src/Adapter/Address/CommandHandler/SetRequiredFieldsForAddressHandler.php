<?php
/**
 * Copyright since 2007 PrestaShop SA and Contributors
 * PrestaShop is an International Registered Trademark & Property of PrestaShop SA
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.md.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/OSL-3.0
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade PrestaShop to newer
 * versions in the future. If you wish to customize PrestaShop for your
 * needs please refer to https://devdocs.prestashop.com/ for more information.
 *
 * @author    PrestaShop SA and Contributors <contact@prestashop.com>
 * @copyright Since 2007 PrestaShop SA and Contributors
 * @license   https://opensource.org/licenses/OSL-3.0 Open Software License (OSL 3.0)
 */

namespace PrestaShop\PrestaShop\Adapter\Address\CommandHandler;

use CustomerAddress;
use PrestaShop\PrestaShop\Core\CommandBus\Attributes\AsCommandHandler;
use PrestaShop\PrestaShop\Core\Domain\Address\Command\SetRequiredFieldsForAddressCommand;
use PrestaShop\PrestaShop\Core\Domain\Address\CommandHandler\SetRequiredFieldsForAddressHandlerInterface;
use PrestaShop\PrestaShop\Core\Domain\Address\Exception\CannotSetRequiredFieldsForAddressException;
use PrestaShopDatabaseException;

/**
 * Handles command which sets required fields for address.
 *
 * @internal
 */
#[AsCommandHandler]
final class SetRequiredFieldsForAddressHandler implements SetRequiredFieldsForAddressHandlerInterface
{
    /**
     * {@inheritdoc}
     *
     * @throws CannotSetRequiredFieldsForAddressException
     */
    public function handle(SetRequiredFieldsForAddressCommand $command)
    {
        $address = new CustomerAddress();

        try {
            if ($address->addFieldsRequiredDatabase($command->getRequiredFields())) {
                return;
            }
        } catch (PrestaShopDatabaseException) {
        }

        throw new CannotSetRequiredFieldsForAddressException(sprintf('Cannot set "%s" required fields for customer', implode(',', $command->getRequiredFields())));
    }
}
