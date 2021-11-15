import React from "react";
import { NavLink } from "react-router-dom";
import { chakra, useColorMode, useColorModeValue, Box, Flex, HStack, Spacer } from "@chakra-ui/react";
import { Account } from "./index";
import { USER_ROLES } from "../helpers/constants";

export default function Header({
  injectedProvider,
  userRole,
  address,
  mainnetProvider,
  userProvider,
  loadWeb3Modal,
  logoutOfWeb3Modal,
  setUserRole,
}) {
  const secondaryFontColor = useColorModeValue("gray.600", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const primaryColorString = useColorModeValue("var(--chakra-colors-gray-700)", "var(--chakra-colors-gray-200)");
  const isSignerProviderConnected =
    injectedProvider && injectedProvider.getSigner && injectedProvider.getSigner()._isSigner;

  return (
    <Box borderBottom="1px" borderColor={borderColor} mb={10} px={8} h={20}>
      <Flex align="center" h="full" fontWeight="semibold">
        <HStack as="ul" spacing={9} style={{ listStyle: "none" }}>
          <chakra.li key="/">
            <NavLink to="/" exact>
              <span role="img" aria-label="castle icon">
                🏃‍♀️
              </span>{" "}
              <strong>Speed Run Ethereum</strong>
            </NavLink>
          </chakra.li>
          {USER_ROLES.anonymous !== userRole && (
            <chakra.li key="/portfolio" color={secondaryFontColor} _hover={{ color: primaryColorString }}>
              <NavLink
                to="/portfolio"
                exact
                activeStyle={{
                  // TODO This is broken, probably because the paths don't match after the redirect
                  color: primaryColorString,
                }}
              >
                Portfolio
              </NavLink>
            </chakra.li>
          )}
          {USER_ROLES.admin === userRole && (
            <>
              <chakra.li key="/builders" color={secondaryFontColor} _hover={{ color: primaryColorString }}>
                <NavLink
                  to="/builders"
                  exact
                  activeStyle={{
                    color: primaryColorString,
                  }}
                >
                  Builders
                </NavLink>
              </chakra.li>
              <chakra.li key="/builds" color={secondaryFontColor} _hover={{ color: primaryColorString }}>
                <NavLink
                  to="/builds"
                  exact
                  activeStyle={{
                    color: primaryColorString,
                  }}
                >
                  Builds
                </NavLink>
              </chakra.li>
              <chakra.li key="/challenge-review" color={secondaryFontColor} _hover={{ color: primaryColorString }}>
                <NavLink
                  to="/challenge-review"
                  exact
                  activeStyle={{
                    color: primaryColorString,
                  }}
                >
                  Review Challenges
                </NavLink>
              </chakra.li>
            </>
          )}
        </HStack>
        <Spacer />
        <Account
          address={address}
          connectText="Connect Wallet"
          ensProvider={mainnetProvider}
          isWalletConnected={isSignerProviderConnected}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={() => {
            logoutOfWeb3Modal();
            setUserRole(USER_ROLES.anonymous);
          }}
          setUserRole={setUserRole}
          userProvider={userProvider}
          userRole={userRole}
        />
      </Flex>
    </Box>
  );
}
